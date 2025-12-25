
import pandas as pd
import os

# Название файла Excel
excel_file = 'question_template.xlsx'

# Название CSV, которое будет создано
csv_file = 'questions.csv'

# Проверка, что Excel существует
if not os.path.exists(excel_file):
    print(f"Файл {excel_file} не найден в текущей папке!")
else:
    # Чтение Excel
    df = pd.read_excel(excel_file)

    # Сохранение в CSV
    df.to_csv(csv_file, index=False, encoding='utf-8-sig')

    print(f"Файл {csv_file} успешно создан!")
