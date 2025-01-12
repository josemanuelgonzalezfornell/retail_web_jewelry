from utils.database_manager import BBDD_MANAGEMENT
from sqlalchemy import String
from sqlalchemy import inspect, text
import pandas as pd


class LANGUAJE_BBDD_MANAGEMENT(BBDD_MANAGEMENT):
    def __init__(self, database_path):
        self.columns = {"keywords": String,
                        "word_es": String, "word_en": String}
        super().__init__(database_path)
        self.table_name = "languajes"
        self.primary_key = "keywords"

    def create_table_languajes(self):
        self.create_table(self.table_name, self.columns,
                          primary_key=self.primary_key)

    def add_data(self, data: dict):
        inspector = inspect(self.engine)

        if self.table_name in inspector.get_table_names():
            columns = [col['name']
                       for col in inspector.get_columns(self.table_name)]
            if "id" in columns:
                with self.engine.connect() as connection:
                    query = f"SELECT MAX(id) FROM {self.table_name}"
                    result = connection.execute(text(query))
                    max_id = result.scalar()
                    next_id = (max_id or 0) + 1
                data['id'] = next_id

            data["create_date"] = pd.to_datetime("now")
            data["update_date"] = pd.to_datetime("now")
            df = pd.DataFrame([data])
            df.to_sql(self.table_name, self.engine,
                      if_exists='append', index=False)

            print(
                f"Los datos han sido cargados en la tabla {self.table_name} de la base de datos.")
        else:
            print(f"La tabla {self.table_name} no existe en la base de datos.")

    def get_all_data(self):
        query = self.session.query(self.models[self.table_name.capitalize()])
        primary_key = self.models[self.table_name.capitalize(
        )].__table__.primary_key.columns[0].name
        result = query.all()

        # Convertir el resultado a un DataFrame
        # Convierte las filas a diccionarios
        data = [row.__dict__ for row in result]
        for item in data:
            # Elimina metadatos internos de SQLAlchemy
            item.pop('_sa_instance_state', None)

        df = pd.DataFrame(data)
        df = df.set_index(primary_key)

        return df

    def get_language_data(self):
        all_data_df = self.get_all_data()
        json_filtered = all_data_df[["word_en", "word_es"]].to_json()

        return json_filtered
