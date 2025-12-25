import csv
import json

data = []

with open('questions.csv', newline='', encoding='utf-8-sig') as csvfile:
    reader = csv.DictReader(csvfile)
    for row in reader:
        q = {
            "id": row["id"],
            "type": row["type"],
            "question": row["question"],
            "hint": row.get("hint", "")
        }
        if row["type"] == "text":
            q["answer"] = row["answer"]
        elif row["type"] in ["radio", "checkbox"]:
            q["options"] = row["options"].split(';')
            q["correct"] = [int(x) for x in row["correct"].split(';') if x != '']
        if row['type'] == 'match':
            q['options'] = row['options'].split(';')
            q['answer'] = row['answer']  # строка A1B2C3

        data.append(q)

with open('questions.json', 'w', encoding='utf-8') as f:
    json.dump(data, f, ensure_ascii=False, indent=2)

print("Готово! Файл questions.json создан.")
