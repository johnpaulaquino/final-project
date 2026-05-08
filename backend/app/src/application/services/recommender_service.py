import pickle
import os
import numpy as np
from sklearn.metrics.pairwise import cosine_similarity

# ── Path to your saved model ──────────────────────────────────────────────────
# Put biskota_recommender.pkl in the backend/ root folder
BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(__file__))))
MODEL_PATH = os.path.join(BASE_DIR, "biskota_recommender.pkl")

# ── Intent expansion map (same as notebook Cell 4) ───────────────────────────
INTENT_MAP = {
    'sweet':       'sweet dessert cake pastry sugar chocolate cookie cinnamon',
    'savory':      'savory bread garlic cheese ham pizza pasta filling',
    'spicy':       'spicy jalapeno hot',
    'chocolatey':  'chocolate fudgy brownie rich cocoa',
    'creamy':      'cream cheese alfredo basque rich',
    'light':       'light pesto chamomile soup lugaw lemonade',
    'healthy':     'sugar-free protein zero cookie fitness healthy',
    'fruity':      'blueberry apple lemon citrus fruity',
    'nutty':       'pistachio biscoff nutty cookie butter',
    'breakfast':   'cinnamon roll bun bread pastry warm',
    'lunch':       'pasta lasagna baked macaroni alfredo pesto savory',
    'snack':       'cookie brownie bite small bites portable',
    'gift':        'bento cake special occasion celebration',
    'party':       'bento cake pizza bites shareable',
    'indulgent':   'chocolate fudgy brownie cream rich premium dubai',
    'comfort':     'warm bread pasta lasagna lugaw garlic cream',
    'refreshing':  'lemonade tea cold citrus light',
    'premium':     'dubai bento basque pistachio kunafa',
    'trending':    'dubai biscoff korean pistachio',
    'popular':     'korean garlic lasagna ube dubai alfredo',
    'sugar free':  'sugar-free zero lemonade hot chocolate protein',
    'vegetarian':  'pesto pasta cheese focaccia cookie cake lemonade tea',
    'merienda':    'snack cookie brownie cinnamon roll bun bite small',
    'dessert':     'cake brownie cookie chocolate sweet cinnamon roll',
    'drink':       'lemonade tea hot chocolate beverage',
}


class RecommenderService:
    _model = None  # cached after first load

    @classmethod
    def _load_model(cls):
        """Load model once and cache it in memory."""
        if cls._model is None:
            if not os.path.exists(MODEL_PATH):
                raise FileNotFoundError(
                    f"biskota_recommender.pkl not found at {MODEL_PATH}. "
                    "Please run the Colab notebook and download the .pkl file "
                    "to your backend/ folder."
                )
            with open(MODEL_PATH, "rb") as f:
                cls._model = pickle.load(f)
        return cls._model

    @classmethod
    def _expand_query(cls, text: str) -> str:
        """Expand vague words into richer query terms."""
        expanded = [text]
        text_lower = text.lower()
        for intent, expansion in INTENT_MAP.items():
            if intent in text_lower:
                expanded.append(expansion)
        return " ".join(expanded)

    @classmethod
    def recommend(cls, query: str, top_n: int = 4) -> list:
        """
        Returns top_n product recommendations for a given query string.
        Called by the /recommend route.
        """
        model = cls._load_model()

        vectorizer     = model["vectorizer"]
        product_matrix = model["product_matrix"]
        df             = model["products_df"]

        expanded  = cls._expand_query(query)
        query_vec = vectorizer.transform([expanded])

        sims  = cosine_similarity(query_vec, product_matrix).flatten()
        boost = df["popular"].astype(float).values * 0.10
        sims  = sims + boost

        top_idx = sims.argsort()[::-1][:top_n]

        results = []
        for i in top_idx:
            row = df.iloc[i]
            results.append({
                "product_id": row["product_id"],
                "name":       row["name"],
                "category":   row["category"],
                "price":      int(row["price"]),
                "image_url":  row["image_url"],
                "score":      round(float(sims[i]), 4),
            })

        return results