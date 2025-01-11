from utils.database_manager import BBDD_MANAGEMENT
from sqlalchemy import String

class LANGUAJE_BBDD_MANAGEMENT(BBDD_MANAGEMENT):
    def __init__(self, database_path):
        self.columns = {"keywords": String, "word_es": String, "word_en": String}
        super().__init__(database_path)

    def create_table_languajes(self):
        table_name = "languajes"
        primary_key = "keywords"
        self.create_table(table_name, self.columns, primary_key=primary_key)