from sqlalchemy import create_engine, Column, Integer, String, inspect, DateTime, text, ForeignKey
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, relationship
import pandas as pd

class BBDD_MANAGEMENT():
    def __init__(self, database_path, rag_manager):
        self.engine = create_engine(f"sqlite:///{database_path}")
        with self.engine.connect() as conn:
            conn.execute("PRAGMA foreign_keys = ON;")
        self.Base = declarative_base()
        self.Session = sessionmaker(bind=self.engine)
        self.session = self.Session()
        self.tables = inspect(self.engine).get_table_names()
        self.models = self._generate_models()
        self.rag_manager = rag_manager
            
    def _generate_models(self):
        """
        Generates dynamic SQLAlchemy model classes for each table in the database.

        This function inspects the database schema to retrieve the list of tables and their
        corresponding columns. For each table, it dynamically creates a SQLAlchemy model class
        with the appropriate column definitions, including primary keys. The model classes are
        stored in a dictionary with the table name (capitalized) as the key.

        Returns:
            dict: A dictionary mapping table names (capitalized) to their corresponding SQLAlchemy model classes.
        """

        inspector = inspect(self.engine)
        models = {}

        for table_name in self.tables:
            columns = []
            for column_info in inspector.get_columns(table_name):
                column_name = column_info['name']
                column_type = column_info['type']
                columns.append(Column(column_name, column_type, primary_key=column_info.get('primary_key', False)))

            # Crear la clase dinámica
            model = type(
                table_name.capitalize(),
                (self.Base,),
                {'__tablename__': table_name, **{col.name: col for col in columns}}
            )
            models[table_name.capitalize()] = model

        return models

    def create_table(self, table_name: str, columns: dict, relationships: dict = None, primary_key: str = 'id'):
        # verify if the table already exists
        inspector = inspect(self.engine)
        if table_name in inspector.get_table_names():
            print(f"La tabla {table_name} ya existe en la base de datos.")
            return

        # Create a class for the table
        attrs = {'__tablename__': table_name}
        for column_name, column_type in columns.items():
            if column_name == primary_key:
                attrs[column_name] = Column(column_type, primary_key=True)

            else:
                attrs[column_name] = Column(column_type)
        
        if relationships:
            for column_name, rel_info in relationships.items():
                ref_table = rel_info['reference_table']
                ref_column = rel_info['reference_column']
                attrs[column_name] = Column(columns[column_name], ForeignKey(f"{ref_table}.{ref_column}"))
                relationship_name = f"{ref_table}_relation"
                attrs[relationship_name] = relationship(ref_table.capitalize())
        
        attrs["create_date"] = Column(DateTime, nullable=False)
        attrs["update_date"] = Column(DateTime, nullable=False)

        # Create the table
        model = type(table_name.capitalize(), (self.Base,), attrs)
        self.Base.metadata.create_all(self.engine)
        self.models[table_name.capitalize()] = model

        print(f"La tabla {table_name} ha sido creada en la base de datos.")

    def drop_table(self, table_name: str):
        inspector = inspect(self.engine)
        if table_name in inspector.get_table_names():
            self.models[table_name.capitalize()].__table__.drop(self.engine)
            print(f"La tabla {table_name} ha sido eliminada de la base de datos.")
        else:
            print(f"La tabla {table_name} no existe en la base de datos.")

    def add_data(self, table_name: str, data: dict):
        inspector = inspect(self.engine)
        

        if table_name in inspector.get_table_names():
            columns = [col['name'] for col in inspector.get_columns(table_name)]
            if "id" in columns:
                with self.engine.connect() as connection:
                    query = f"SELECT MAX(id) FROM {table_name}"
                    result = connection.execute(text(query))
                    max_id = result.scalar()
                    next_id = (max_id or 0) + 1
                data['id'] = next_id
            
            data["create_date"] = pd.to_datetime("now")
            data["update_date"] = pd.to_datetime("now")
            df = pd.DataFrame([data])
            df.to_sql(table_name, self.engine, if_exists='append', index=False)
            
            self.rag_manager.add_data(data)

            print(f"Los datos han sido cargados en la tabla {table_name} de la base de datos.")
        else:
            print(f"La tabla {table_name} no existe en la base de datos.")


    def get_data_filtered(self, table_name: str, filters: dict):
        query = self.session.query(self.models[table_name.capitalize()])
        primary_key = self.models[table_name.capitalize()].__table__.primary_key.columns[0].name
        for key, value in filters.items():
            query = query.filter(getattr(self.models[table_name.capitalize()], key) == value)
        
        # Ejecutar la consulta
        result = query.all()
        
        # Convertir el resultado a un DataFrame
        data = [row.__dict__ for row in result]  # Convierte las filas a diccionarios
        for item in data:
            item.pop('_sa_instance_state', None)  # Elimina metadatos internos de SQLAlchemy

        df = pd.DataFrame(data)
        df = df.set_index(primary_key)
        return df
    
    def modify_data(self, table_name: str, filters: dict, data: dict):
        query = self.session.query(self.models[table_name.capitalize()])
        data["date_update"] = pd.to_datetime("now")
        for key, value in filters.items():
            query = query.filter(getattr(self.models[table_name.capitalize()], key) == value)
        

        # Actualizar los registros con los nuevos valores
        rows_updated = query.update(data, synchronize_session='fetch')
        self.session.commit()

        print(f"{rows_updated} registros han sido actualizados en la tabla {table_name} de la base de datos.")
    
    def get_all_data(self, table_name: str):
        query = self.session.query(self.models[table_name.capitalize()])
        primary_key = self.models[table_name.capitalize()].__table__.primary_key.columns[0].name
        result = query.all()
        
        # Convertir el resultado a un DataFrame
        data = [row.__dict__ for row in result]  # Convierte las filas a diccionarios
        for item in data:
            item.pop('_sa_instance_state', None)  # Elimina metadatos internos de SQLAlchemy

        df = pd.DataFrame(data)
        df = df.set_index(primary_key)
        return df
    
    def get_columns(self, table_name: str):
        inspector = inspect(self.engine)
        columns = inspector.get_columns(table_name)
        return columns
    
    def drop_data(self, table_name: str, filters: dict):
        query = self.session.query(self.models[table_name.capitalize()])
        try:
            for key, value in filters.items():
                query = query.filter(getattr(self.models[table_name.capitalize()], key) == value)
            
            # Eliminar los registros
            rows_deleted = query.delete(synchronize_session='fetch')
            self.session.commit()

            print(f"{rows_deleted} registros han sido eliminados de la tabla {table_name} de la base de datos.")
        except Exception as e:
            print(f"Error al eliminar los registros de la tabla {table_name}: {str(e)}")