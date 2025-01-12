
from langchain_openai import AzureChatOpenAI
import os
from langchain_core.messages import HumanMessage, SystemMessage
from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder
from langchain_core.messages import HumanMessage, RemoveMessage
from langgraph.checkpoint.memory import MemorySaver
from langgraph.graph import START, MessagesState, StateGraph
from langchain.vectorstores import FAISS
from langchain_openai import AzureOpenAIEmbeddings
import re
import json


class RAGManager:

    def __init__(self):
        self.embedding_function = AzureOpenAIEmbeddings(
            model=os.getenv("EMB_OPENAI_DEPLOIMENT_MODEL"),  # Nombre del modelo desplegado
            api_key=os.getenv("EMB_OPENAI_API_KEY"),
            azure_endpoint=os.getenv("EMB_OPENAI_ENDPOINT"),
            openai_api_version=os.getenv("EMB_OPENAI_API_VERSION"),
        )
        self.faiss_index_file = "./faiss_index"
        self.vectorstore = FAISS.load_local(
            folder_path=self.faiss_index_file,
            embeddings=self.embedding_function,
            allow_dangerous_deserialization=True
        )
        self.ai_client = AzureChatOpenAI(
            azure_endpoint=os.getenv("OPENAI_ENDPOINT"),
            api_key=os.getenv("OPENAI_API_KEY"),
            deployment_name=os.getenv("OPENAI_DEPLOIMENT_MODEL"),
            api_version=os.getenv("OPENAI_API_VERSION")
        )

        self.app = self.set_chatbot_workflow()

    def set_chatbot_workflow(self):
        workflow = StateGraph(state_schema=MessagesState)

        workflow.add_node("model", self.call_model)
        workflow.add_edge(START, "model")

        # Add simple in-memory checkpointer
        memory = MemorySaver()
        app = workflow.compile(checkpointer=memory)

        return app
    
    def add_data(self, data: dict):
        text = f"Producto: {data['name']}. Color: {data['color']}. Precio: {data['price']}. Descripción: {data['description']}."
        metadata = {"id": data['id'], "color": data['color'], "price": data['price']}
        self.vectorstore.add_texts(
            texts=[text],
            metadatas=[metadata]
        )
        print(
            f"El producto con ID {data['id']} ha sido añadido al vectorstore.")

    def drop_data(self, filters: dict):
        documents = self.vectorstore.similarity_search(
            " ", k=len(self.vectorstore.index))
        # Filtrar documentos que no coincidan con los filtros
        filtered_documents = [
            doc for doc in documents
            if not all(doc.metadata.get(key) == value for key, value in filters.items())
        ]

        # Reconstruir el vectorstore sin los documentos eliminados
        texts = [doc.page_content for doc in filtered_documents]
        metadatas = [doc.metadata for doc in filtered_documents]

        # Crear un nuevo vectorstore
        self.vectorstore = FAISS.from_texts(
            texts=texts,
            embedding=self.embedding_function,
            metadatas=metadatas
        )

        print(
            f"Los datos que cumplen los filtros {filters} han sido eliminados del vectorstore.")
        
    def retrieve_data(self, query: str):
        total_len_doc = self.vectorstore.index.ntotal
        print(f"total_len_doc:{total_len_doc}")

        prompt = ChatPromptTemplate.from_messages(
            [
                SystemMessage(
                    content="Vas a recibir preguntas para buscar por similitud usando como modelo text-embedding-3-small y como vectorstore FAISS. Los valores de metadatos que tiene el vectorstore son id, color y precio. necesito que me devuelvas un filtro con los metadatos necesarios para aplicarlo en la función de búsqueda por similitud. Devuelve únicamente el diccionario y nada más, no indiques que es un json o un diccionario, devuelve solo el diccionario."
                ),
                MessagesPlaceholder(variable_name="messages"),
            ]
        )

        chain = prompt | self.ai_client

        filters = chain.invoke(
            {
                "messages": [
                    HumanMessage(
                        content=f"Pregunta: {query}"
                    )
                ],
            }
        )
        
        print(filters.content)
        print(type(filters.content))

        filters = json.loads(filters.content)
        print(filters)
        print(type(filters))
        if filters is not None:
            result = self.vectorstore.similarity_search(
                query, k=total_len_doc, filter=filters
            )
            print(f"filtros: {filters}")
        else:
            result = self.vectorstore.similarity_search(
                query, k=total_len_doc
            )
        print(result)

        output_ids = []
        output_text = []
        for doc in result:
            output_ids.append(doc.metadata["id"])
            output_text.append(doc.page_content)

        return output_ids, output_text
    
    def call_model(self, state: MessagesState):
        system_prompt = (
            "You are a helpful assistant. "
            "Answer all questions to the best of your ability. "
            "The provided chat history includes a summary of the earlier conversation."
        )

        system_message = SystemMessage(content=system_prompt)
        message_history = state["messages"][:-1]  # exclude the most recent user input
        # Summarize the messages if the chat history reaches a certain size
        if len(message_history) >= 4:
            last_human_message = state["messages"][-1]
            # Invoke the model to generate conversation summary
            summary_prompt = (
                "Distill the above chat messages into a single summary message. "
                "Include as many specific details as you can."
            )
            summary_message = self.ai_client.invoke(
                message_history + [HumanMessage(content=summary_prompt)]
            )

            # Delete messages that we no longer want to show up
            delete_messages = [RemoveMessage(id=m.id) for m in state["messages"]]
            # Re-add user message
            human_message = HumanMessage(content=last_human_message.content)
            # Call the model with summary & response
            response = self.ai_client.invoke([system_message, summary_message, human_message])
            message_updates = [summary_message, human_message, response] + delete_messages
        else:
            message_updates = self.ai_client.invoke([system_message] + state["messages"])

        return {"messages": message_updates}

    def chatbot(self, query: str, thread_number):
        output_ids, output_text = self.retrieve_data(query)
        print(f"output_text: {output_text}")
        print(f"output_ids: {output_ids}")

        query = f"Base de datos a usar para la respuesta: {output_text}, Pregunta: {query}"
        print(query)

        output_prompt = self.app.invoke(
            {
            "messages": [HumanMessage(content=query)],  
        },
            config={"configurable": {"thread_id": f"{thread_number}"}},
        )

        return output_prompt["messages"][-1].content
