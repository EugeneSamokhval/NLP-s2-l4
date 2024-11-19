import torch
from transformers import pipeline, MarianTokenizer,  AutoModelForSeq2SeqLM


class TextTranslation:
    def __init__(self) -> None:
        model_name = "Helsinki-NLP/opus-mt-en-ru"
        self.pipe = pipeline(
            "translation_en_to_ru", model=model_name, tokenizer=model_name)

    def translate_text(self, text):
        result = self.pipe(text)[0]["translation_text"]
        return result
