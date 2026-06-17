# Echo — Data Science Documentation

> A complete walkthrough of every data science decision in Echo, written for academic review.
> Covers foundational concepts through advanced pipeline design.

---

## Table of Contents

1. [Problem Framing](#1-problem-framing)
2. [Data Collection Design](#2-data-collection-design)
3. [Database Schema — A DS Perspective](#3-database-schema--a-ds-perspective)
4. [Privacy by Architecture](#4-privacy-by-architecture)
5. [Text Preprocessing Pipeline](#5-text-preprocessing-pipeline)
6. [Sentiment Analysis](#6-sentiment-analysis)
7. [TF-IDF — Term Importance Extraction](#7-tf-idf--term-importance-extraction)
8. [K-Means Clustering](#8-k-means-clustering)
9. [Principal Component Analysis (PCA)](#9-principal-component-analysis-pca)
10. [Anomaly Detection — Z-Score Method](#10-anomaly-detection--z-score-method)
11. [Priority Scoring Algorithm](#11-priority-scoring-algorithm)
12. [Time-Series Forecasting — Linear Regression](#12-time-series-forecasting--linear-regression)
13. [Descriptive Statistics and Aggregations](#13-descriptive-statistics-and-aggregations)
14. [The Campus Heatmap](#14-the-campus-heatmap)
15. [Word Cloud Generation](#15-word-cloud-generation)
16. [Pipeline Architecture](#16-pipeline-architecture)
17. [Edge Cases and Robustness](#17-edge-cases-and-robustness)
18. [Evaluation and Limitations](#18-evaluation-and-limitations)
19. [DS Curriculum Alignment Checklist](#19-ds-curriculum-alignment-checklist)

---

## 1. Problem Framing

### What kind of problem is this?

Echo is a **text analytics and pattern recognition** system operating on short, informal, unstructured natural language data. It combines:

- **NLP** (understanding and extracting meaning from text)
- **Unsupervised machine learning** (grouping text without predefined labels)
- **Statistical monitoring** (detecting unusual patterns in time-series counts)
- **Descriptive analytics** (summarizing a dataset across multiple dimensions)

### Why unsupervised learning?

We cannot label incoming suggestions as "about wifi" or "about bathrooms" before they arrive. There is no labelled training dataset. The system must discover structure in the text on its own — this is the defining characteristic of **unsupervised learning**.

Supervised learning (e.g., a text classifier) would require hundreds of manually labelled examples per category, retraining whenever a new topic emerges, and ongoing human annotation. Unsupervised clustering adapts automatically as the dataset grows.

### The core insight

Students describe problems using natural language. The same underlying issue — say, broken air conditioning in Block B — will appear across many submissions using different words: "AC doesn't work", "classroom is too hot", "cooling is broken". A clustering algorithm groups these into one topic automatically by detecting that the same terms co-occur. The admin sees the cluster, not 50 individual complaints.

---

## 2. Data Collection Design

### Controlled vocabulary fields

Category and location are **dropdown selections**, not free text. This is a deliberate data quality decision:

- Free-text category fields produce unbounded noise ("facilities", "Facilities", "FACILITIES!", "facility issue") that require normalization before any grouping
- Controlled vocabulary ensures `category` is always one of a fixed set: `{Facilities, Academic, Campus Life, Open}`
- This makes `GROUP BY category` in Pandas/SQL immediately useful with zero cleaning

### Free-text field

The suggestion text itself is uncontrolled — students write whatever they want. This field feeds the NLP pipeline. The tradeoff is noise (slang, typos, mixed language) in exchange for authentic, unfiltered expression.

### Temporal fields

Every row stores `created_at` (ISO timestamp), `week_num`, and `month_num`. Storing derived time fields at write time is a common DS optimization:

- Avoids recomputing date arithmetic on every query
- `week_num` enables `GROUP BY week_num` for trend analysis without `STRFTIME` parsing
- Consistent with the **data warehouse** pattern of pre-computing aggregation keys

### Processing flag

`processed INTEGER DEFAULT 0` acts as a **job queue flag**. It separates raw submissions from NLP-enriched ones, enabling incremental processing: only new (unprocessed) rows pass through the expensive NLP pipeline on each admin request.

---

## 3. Database Schema — A DS Perspective

```sql
CREATE TABLE suggestions (
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
    token           TEXT NOT NULL UNIQUE,       -- anonymity token
    category        TEXT NOT NULL,              -- controlled vocabulary
    location        TEXT NOT NULL,              -- controlled vocabulary
    location_x      INTEGER DEFAULT 0,          -- heatmap column (1–5)
    location_y      INTEGER DEFAULT 0,          -- heatmap row (1–5)
    text_original   TEXT NOT NULL,              -- raw student text
    text_clean      TEXT,                       -- cleaned text (NLP output)
    sentiment_score REAL,                       -- polarity: -1.0 to +1.0
    sentiment_label TEXT,                       -- positive / neutral / negative
    priority_score  REAL,                       -- composite ranking score
    keywords        TEXT,                       -- JSON array: top 5 TF-IDF terms
    cluster_id      INTEGER,                    -- K-Means cluster assignment
    created_at      TEXT NOT NULL,              -- ISO datetime
    week_num        INTEGER,                    -- pre-computed week number
    month_num       INTEGER,                    -- pre-computed month number
    processed       INTEGER DEFAULT 0           -- pipeline completion flag
);
```

### Why store both `text_original` and `text_clean`?

`text_original` is never modified — it preserves what the student actually wrote, important for audit trails and displaying to the admin. `text_clean` is the NLP-processed version used for computation. Storing both avoids re-running the NLP pipeline on every analytics request.

### Why `keywords TEXT` as JSON?

SQLite has no array type. Storing `["library", "hours", "wifi"]` as a JSON string is the standard SQLite pattern for variable-length lists. Python reads it back with `json.loads()`.

### Normal form considerations

The schema is intentionally **denormalized** — `category` and `location` are stored as strings directly on each row rather than as foreign keys to a categories/locations table. This is a deliberate data warehouse tradeoff: for analytical `GROUP BY` queries, string columns are simpler and faster than joins. The authoritative `categories` and `locations` tables exist for configuration, but analytics reads from `suggestions` directly.

---

## 4. Privacy by Architecture

### Structural anonymity vs policy anonymity

**Policy anonymity** says: "We promise not to track you." It relies on trust and is as weak as the organization's internal controls.

**Structural anonymity** (what Echo uses) means: the system is architected so that it *cannot* link a submission to a person, even if someone tries. This is a much stronger guarantee.

### How Echo achieves structural anonymity

**1. No identity collection at all.** The submission endpoint `POST /suggestions` takes only `category`, `location`, and `text`. There is no username field, no email field, no device fingerprint, no IP logging anywhere in the stack.

**2. UUID4 tokens.** Python's `uuid.uuid4()` generates a 128-bit random number from a cryptographically secure random source. It is assigned after submission — it cannot be predicted by the student, and it carries no campus-ID encoded information. Even if two people submit at the exact same second, their tokens will be different.

```python
import uuid
token = str(uuid.uuid4())  # e.g., "3f2504e0-4f89-11d3-9a0c-0305e82c3301"
```

The token is shown to the student once as a receipt. They can use it to check their submission's processing status at the `/track` endpoint. The admin never sees individual tokens.

**3. Rate-limiting without identity.** The browser generates a random `session_id` string locally. This is sent with each submission to check rate limits. It is stored in the `rate_limit` table only with a timestamp — never alongside any submission text. After 24 hours, rate-limit records are deleted. The server never stores `session_id` in a way that lets it connect multiple submissions to the same person.

---

## 5. Text Preprocessing Pipeline

Raw student text is messy: mixed case, punctuation, filler words ("the", "a", "is"), numbers, and sometimes emoji. Before any NLP can work on it, the text must be standardized. This is called **text preprocessing** or **text normalization**.

### Step 1 — Lowercasing

```python
text = text.lower()
# "The Library Closes EARLY" → "the library closes early"
```

"Library" and "library" are the same word. Lowercasing ensures they are treated identically by all downstream algorithms. Without this step, the term-frequency counts split across both forms.

### Step 2 — Punctuation and special character removal

```python
text = re.sub(r"[^a-zA-Z\s]", "", text)
# "wifi doesn't work!!!" → "wifi doesnt work"
```

Punctuation carries almost no semantic information for topic modeling. Removing it prevents "library." and "library" from being counted as different terms in TF-IDF.

### Step 3 — Tokenization

```python
tokens = word_tokenize(text)   # NLTK's word tokenizer
# "doesnt work well" → ["doesnt", "work", "well"]
```

**Tokenization** is the process of splitting continuous text into individual units (tokens). NLTK's `word_tokenize` handles contractions and edge cases better than a simple `split()`. A `try/except` wrapper falls back to `.split()` if NLTK's tokenizer fails (e.g., on very short strings).

### Step 4 — Stopword removal

```python
from nltk.corpus import stopwords
_STOP = set(stopwords.words("english"))
tokens = [t for t in tokens if t not in _STOP and len(t) > 2]
```

**Stopwords** are common words that appear in almost every document and carry no discriminating information: "the", "a", "is", "in", "and", "that". If we kept them, TF-IDF's inverse document frequency (IDF) would give them extremely low scores anyway — but removing them saves memory and computation in the vocabulary.

The `len(t) > 2` filter additionally removes single-character noise like "s" or "n" that survives punctuation removal.

### Output

```
Input:  "The AC in Block B doesn't work at all, it's been 3 weeks!!!"
Output: "ac block doesnt work weeks"
```

This cleaned string is stored in `text_clean` and used for TF-IDF and K-Means.

---

## 6. Sentiment Analysis

### What is sentiment polarity?

Sentiment analysis classifies the emotional tone of text on a scale from negative to positive. Echo uses **TextBlob**, a Python library built on top of a manually annotated lexicon (dictionary of word sentiments).

```python
from textblob import TextBlob

score = TextBlob(text).sentiment.polarity
# Returns a float in [-1.0, +1.0]
# -1.0 = extremely negative, 0.0 = neutral, +1.0 = extremely positive
```

### How TextBlob computes polarity

TextBlob's sentiment engine is a **lexicon-based approach**, not a neural network. It has a dictionary of words with pre-assigned polarity scores. For a given piece of text, it:

1. Looks up each recognizable word in its lexicon
2. Applies modifier rules (e.g., "not" reverses polarity, "very" intensifies it)
3. Averages the scores across all scored words
4. Returns the mean as the document polarity

This means "The library is terrible" → negative score because "terrible" has a strong negative lexicon entry. "The library is great" → positive because "great" has a positive entry. "The library is closed" → near-zero because "closed" is neutral in most sentiment lexicons.

### Thresholding to labels

```python
if score > 0.1:
    label = "positive"
elif score < -0.1:
    label = "negative"
else:
    label = "neutral"
```

The ±0.1 threshold avoids classifying very weak signals (e.g., score = 0.03) as either positive or negative. This is called **dead-band thresholding** — a common technique when the signal is noisy near zero.

### Limitations of lexicon-based sentiment

TextBlob was designed for general English. Student feedback has domain-specific language: "the food is dead" (Urdu slang meaning excellent) could score as negative. For production use, a fine-tuned model (e.g., `cardiffnlp/twitter-roberta-base-sentiment`) trained on student or social media text would outperform TextBlob. Echo uses TextBlob because it requires no GPU, no model download, and works offline — consistent with the self-hosted, campus-local architecture.

---

## 7. TF-IDF — Term Importance Extraction

TF-IDF (Term Frequency–Inverse Document Frequency) is one of the most important algorithms in classical NLP. It answers the question: **which words are specifically important to this document, not just common across all documents?**

### Term Frequency (TF)

TF measures how often a word appears in a single document (one submission). If "library" appears 3 times in a 50-word submission, its TF in that document is 3/50 = 0.06.

```
TF(term, document) = count of term in document / total terms in document
```

### Inverse Document Frequency (IDF)

IDF measures how rare a word is across all documents. If "library" appears in 80 out of 100 submissions, it is very common and not very discriminating. If "microscope" appears in only 2 submissions, it is highly specific and informative.

```
IDF(term) = log( total documents / documents containing term )
```

- A term in every document: `log(100/100) = log(1) = 0` → downweighted to zero
- A term in one document: `log(100/1) = log(100) ≈ 4.6` → strongly upweighted

### TF-IDF Score

```
TF-IDF(term, document) = TF(term, document) × IDF(term)
```

A high TF-IDF score means the term appears frequently in this specific document AND rarely across all other documents — making it a strong keyword for this submission.

### Implementation in Echo

```python
from sklearn.feature_extraction.text import TfidfVectorizer

# For keyword extraction per submission
vectorizer = TfidfVectorizer(max_features=150, ngram_range=(1, 2), min_df=1)
matrix = vectorizer.fit_transform(texts)  # shape: (n_submissions, n_features)
features = vectorizer.get_feature_names_out()

# For each document, get top 5 scoring terms
row = matrix.getrow(idx).toarray()[0]
top = row.argsort()[-5:][::-1]
keywords = [features[j] for j in top if row[j] > 0]
```

**`ngram_range=(1, 2)`** means the vocabulary includes both single words ("library") and two-word phrases ("library hours", "ac broken"). Bigrams often carry more meaning than unigrams alone.

**`max_features=150`** caps the vocabulary at 150 terms. Without this, a large dataset could produce a vocabulary of 10,000+ terms, making the matrix very wide and slow to compute.

**`min_df=1`** means a term only needs to appear in at least 1 document to be included. In a small dataset, raising this to 2 or 3 would filter out typos but also potentially remove rare but valid terms.

### Why TF-IDF instead of just counting words?

A simple word count (Bag of Words) gives high scores to common words like "university" or "campus" that appear everywhere. TF-IDF automatically downweights these and surfaces the genuinely distinctive terms. This is why TF-IDF is almost always preferred over raw counts for document similarity, keyword extraction, and as input to clustering algorithms.

---

## 8. K-Means Clustering

K-Means is an **unsupervised machine learning algorithm** that groups data points into K clusters by minimizing the distance from each point to the center (centroid) of its assigned cluster.

### The algorithm — step by step

**Initialization:** Place K centroids randomly in the feature space.

**Assignment step:** For each data point, calculate its distance to every centroid. Assign the point to the closest centroid. This forms K groups.

**Update step:** Recalculate each centroid as the mean of all points assigned to it. The centroid moves to the middle of its group.

**Repeat:** Keep alternating Assignment → Update until centroids stop moving (convergence). This is guaranteed to converge but not necessarily to the global optimum.

```
Initial:    ●  ◆  ▲   (3 centroids placed randomly)
              scattered data points everywhere

After step 1: points assigned to nearest centroid

After step 2: centroids move to mean of their group

After N steps: stable clusters — no point wants to change cluster
```

### How submissions become data points

Each submission (after cleaning) is converted to a TF-IDF vector. If the vocabulary has 200 terms, each submission becomes a point in **200-dimensional space**. The "distance" between two submissions is the Euclidean distance between their TF-IDF vectors — submissions using similar words will be close together.

### Why k=6?

```python
N_CLUSTERS = 6
```

This is a domain-informed hyperparameter choice. A university campus typically generates feedback in roughly these broad topic areas: academic experience, library and study spaces, facilities and maintenance, cafeteria and food, IT and wifi, campus safety/transport. Six clusters maps reasonably to this prior knowledge.

In production, the **Elbow Method** or **Silhouette Score** would be used to find the optimal k empirically:

```python
from sklearn.metrics import silhouette_score

inertias = []
sil_scores = []
for k in range(2, 12):
    km = KMeans(n_clusters=k, random_state=42, n_init=10)
    labels = km.fit_predict(X)
    inertias.append(km.inertia_)
    sil_scores.append(silhouette_score(X, labels))
# Plot inertia (elbow) and silhouette score → pick k at the elbow
```

The **Silhouette Score** measures how similar each point is to its own cluster vs neighbouring clusters. A score near +1 means tight, well-separated clusters. A score near 0 means overlapping clusters.

### Auto-labelling clusters

After clustering, each cluster needs a human-readable name. Echo generates this automatically from the K-Means centroids:

```python
features = vectorizer.get_feature_names_out()
for c in range(k):
    center = km.cluster_centers_[c]
    # Only take features that have actual positive weight in the centroid
    top_idx = [i for i in center.argsort()[-5:][::-1] if center[i] > 0][:3]
    label = " / ".join(features[i] for i in top_idx) if top_idx else f"Cluster {c + 1}"
    cluster_labels[str(c)] = label
```

The centroid of a cluster is the **mean TF-IDF vector** across all submissions in that cluster. The features with the highest centroid weights are the terms most representative of that cluster. So if cluster 2 contains submissions about wifi, AC, and broken equipment, its centroid will have high weights for "wifi", "ac broken", "equipment" — producing the label "wifi / ac broken / equipment".

The `if center[i] > 0` guard ensures we only use features that actually have positive weight — avoiding the edge case where a cluster centroid is all zeros (uniform distribution) which would yield random vocabulary words as the label.

### Limitations of K-Means

- **Assumes spherical clusters.** K-Means uses Euclidean distance, which works best when clusters are roughly spherical and similarly sized. Text clusters are often elongated or irregular.
- **Sensitive to initialization.** `n_init=10` runs K-Means 10 times with different random seeds and picks the best result, mitigating this.
- **Fixed k.** If the true number of topics changes (more diverse campus = more topics), k=6 may be wrong. DBSCAN or hierarchical clustering can discover k automatically but are more complex.
- **High-dimensional space.** The TF-IDF matrix is sparse and high-dimensional. K-Means can struggle with the **curse of dimensionality** — distances become less meaningful in very high dimensions. This is part of why PCA is applied before visualization (though PCA is applied after clustering here, not before, so the clustering itself still operates in full TF-IDF space).

---

## 9. Principal Component Analysis (PCA)

After clustering, each submission is a point in 200-dimensional TF-IDF space. Humans cannot visualize 200 dimensions. PCA reduces this to 2 dimensions so we can draw a scatter plot.

### What PCA does

PCA finds the directions in the high-dimensional space that explain the most **variance** (spread) in the data. The first principal component (PC1) is the single direction along which the data varies the most. PC2 is the second-most-varying direction, orthogonal to PC1.

Projecting all 200-dimensional points onto just PC1 and PC2 gives us 2D coordinates. These coordinates do not correspond to individual words — they are abstract linear combinations of many TF-IDF features — but they preserve as much of the original structure as possible.

```python
from sklearn.decomposition import PCA

arr = X.toarray()  # dense matrix: (n_submissions, n_features)
pca = PCA(n_components=2, random_state=42)
coords = pca.fit_transform(arr)  # shape: (n_submissions, 2)
# coords[:, 0] → x-axis values
# coords[:, 1] → y-axis values
```

### Interpreting the scatter plot

Each dot on the scatter plot is one submission. Dots with the same colour belong to the same K-Means cluster. If the clusters appear as visually distinct groups of dots, it means the topics are well-separated in the original TF-IDF space and K-Means found meaningful structure.

If dots from different clusters are interleaved, it suggests the topics overlap — the submissions use similar language and are hard to separate. This is not a bug; it is information about the nature of the feedback.

### Variance explained

PCA also reports what fraction of the total variance is captured by the chosen components. If PC1 + PC2 explain 80% of the variance, the 2D plot is a very faithful representation of the data. If they explain only 20%, the scatter plot is a rough approximation and many differences between submissions are lost in the projection. For small datasets (100–500 submissions), variance explained is typically higher.

---

## 10. Anomaly Detection — Z-Score Method

The **Z-score** (also called standard score) measures how many standard deviations a data point is from the mean of its distribution. It is one of the simplest and most widely-used statistical anomaly detection methods.

### Formula

```
Z = (x - μ) / σ

where:
    x  = the observed value (e.g., submissions this week)
    μ  = the mean of all weekly submission counts
    σ  = the standard deviation of all weekly submission counts
```

### Application in Echo

```python
import numpy as np
from scipy import stats

w_counts = weekly["count"].values   # e.g., [12, 14, 11, 15, 13, 42, 9]
z = np.abs(stats.zscore(w_counts))  # e.g., [0.3, 0.1, 0.5, 0.2, 0.1, 3.8, 0.7]
anomaly_weeks = weekly[z > 2]["week_label"].tolist()
```

A Z-score above 2 means the value is more than 2 standard deviations above the mean — statistically unusual (by the empirical rule, only ~5% of normally distributed data falls beyond ±2σ). The threshold of 2 is a standard choice for moderate sensitivity; 3 would catch only extreme spikes.

### What does an anomaly mean in context?

A week with Z > 2 means significantly more submissions than usual arrived that week. In a campus context, this likely indicates a real event: a power outage, exam period stress, a cafeteria incident, a policy announcement students are unhappy with. The AnomalyBanner component surfaces this as an alert on the insights page.

### Why not a more complex method?

ARIMA, Isolation Forest, and LSTM-based anomaly detectors exist but require larger datasets and more parameter tuning. For weekly aggregated counts across 20–100 weeks (the typical dataset size for one semester), Z-score is:
- Interpretable (admin can understand "this week was 3σ above normal")
- Statistically justified for approximately normal distributions
- Requires no training data
- Computationally trivial

---

## 11. Priority Scoring Algorithm

The priority score ranks which issues most need admin attention. It is a **weighted composite score** combining two factors:

```python
days_old = max(0, (datetime.now() - created).days)
recency  = max(0.0, 1.0 - days_old / 30)          # 0.0 to 1.0
priority = round(0.4 * recency + 0.2 * abs(score), 4)
```

### Factor 1 — Recency (weight 0.4)

```
recency = max(0, 1 - days_old / 30)
```

A submission from today has recency = 1.0 (maximum). A submission from 30 days ago has recency = 0.0. The denominator of 30 days means the priority decay window is one month — issues older than a month contribute zero recency to their score.

Recency has the highest weight (0.4) because fresh issues are more actionable. An unresolved issue from last semester may be less urgent than a new one that students are still experiencing.

### Factor 2 — Sentiment magnitude (weight 0.2)

```
abs(sentiment_score)  →  strong emotion regardless of direction
```

`abs()` treats both very negative (-0.9) and very positive (+0.9) submissions as high-signal. A neutral submission (score ≈ 0) contributes little. This is intentional: highly positive feedback can surface things that are working well and deserve recognition, while highly negative feedback flags critical issues.

### Current total weight: 0.60

The weights sum to 0.6, not 1.0. This means the maximum achievable priority score is 0.6 (1.0 recency × 0.4 + 1.0 sentiment magnitude × 0.2). This is fine for ranking purposes since all scores are on the same scale.

### What is missing from the current formula

The original design also included **cluster size** as a factor:
```
priority += 0.4 × (cluster_size / total_submissions)
```
This would give higher priority to issues shared by many students (large cluster) vs idiosyncratic complaints. This factor was omitted from the implementation because cluster IDs are assigned after NLP processing, but priority is calculated during NLP. A future improvement would run priority recalculation after clustering is complete.

---

## 12. Time-Series Forecasting — Linear Regression

Echo uses **ordinary least squares (OLS) linear regression** to forecast weekly submission volumes up to 4 weeks ahead.

### Why linear regression for time series?

Many time-series methods (ARIMA, Prophet, LSTM) require dozens or hundreds of time points to fit reliably. A semester has 16–18 weeks. At 1 week per observation, there are at most 16–18 data points. Linear regression is appropriate here because:

- It trains on any number of points ≥ 2
- It assumes a linear trend (submissions growing or declining steadily) which is a reasonable null hypothesis for a semester
- It is interpretable: the slope is the average weekly change in submission count

### Implementation

```python
from scipy import stats
import numpy as np

x = np.arange(len(weekly), dtype=float)   # week index: [0, 1, 2, ...]
y = weekly["count"].values.astype(float)  # submission count per week

slope, intercept, r_value, p_value, std_err = stats.linregress(x, y)
```

### Forecasting

```python
for i in range(1, 5):
    pred = slope * (len(weekly) + i - 1) + intercept
    forecast.append({"week": f"+{i}w", "count": max(0, round(float(pred)))})
```

The model extrapolates the fitted line 4 steps beyond the last observed week. `max(0, ...)` prevents predicting negative submission counts.

### Slope interpretation

```python
momentum = "growing" if slope > 2 else ("declining" if slope < -2 else "stable")
```

| Slope | Meaning |
|---|---|
| > +2 | Submissions increasing by more than 2/week → engagement growing |
| −2 to +2 | Roughly flat → stable engagement |
| < −2 | Submissions decreasing → engagement declining or issues resolving |

The ±2 threshold is tuned for a campus of moderate size. A larger institution might use ±10.

### R² — goodness of fit

```python
r_squared = round(float(r_value ** 2), 3)
```

R² (coefficient of determination) measures how well the linear model fits the data. It ranges from 0 to 1:

- R² = 1.0 → data follows a perfect line
- R² = 0.5 → linear model explains 50% of variance; 50% is unexplained noise
- R² = 0.0 → the linear model is no better than predicting the mean every week

A low R² means the trend is noisy — the forecast should be interpreted with less confidence. Echo displays R² on the trends page so the admin can see how reliable the forecast is.

### Week-over-week change

```python
wow = ((curr - prev) / prev * 100) if prev > 0 else 0.0
```

This is a simpler, lagging indicator — it just compares the most recent week to the one before it, expressed as a percentage change. Unlike the regression slope, it reacts immediately to sudden changes but is noisier.

---

## 13. Descriptive Statistics and Aggregations

Descriptive statistics summarize a dataset without making inferences about a larger population. They are the foundation of the dashboard.

### Measures of central tendency

```python
avg_sentiment  = df["sentiment_score"].mean()    # arithmetic mean
median_sent    = df["sentiment_score"].median()  # middle value (robust to outliers)
```

The **mean** is sensitive to outliers: one very negative outlier pulls the mean down even if most submissions are positive. The **median** is robust: if 90 submissions score +0.5 and 10 score −0.9, the median is still close to +0.5.

Echo reports both on the analytics page. A large gap between mean and median signals that outliers exist — in context, a small number of strongly-negative submissions are dragging the average down.

### Measures of spread

```python
std_sentiment = df["sentiment_score"].std()  # standard deviation
```

Standard deviation measures how widely spread the sentiment scores are. Low std means most submissions cluster near the mean (consistent sentiment). High std means the student body is split — some very positive, some very negative about the same institution.

### Groupby aggregations

```python
cat_counts     = df["category"].value_counts().to_dict()
loc_counts     = df["location"].value_counts().head(10).to_dict()
avg_by_cat     = df.groupby("category")["sentiment_score"].mean().round(3).to_dict()
```

`value_counts()` returns a frequency table — how many submissions each category or location received. `groupby().mean()` computes average sentiment per category, enabling comparisons like "Academic submissions average −0.12 (negative) while Campus Life averages +0.18 (positive)."

### Sentiment delta — week-over-week comparison

```python
this_w = df[df["created_at"] >= week_start]
last_w = df[(df["created_at"] >= last_week_start) & (df["created_at"] < week_start)]

for cat in df["category"].unique():
    tw = this_w[this_w["category"] == cat]["sentiment_score"].mean()
    lw = last_w[last_w["category"] == cat]["sentiment_score"].mean()
    if pd.notna(tw) and pd.notna(lw):
        sentiment_delta[cat] = round(float(tw - lw), 3)
```

This computes how each category's average sentiment changed this week compared to last week. A delta of −0.25 for "Facilities" means students are significantly more negative about facilities this week — a signal that something changed (e.g., an elevator broke, the AC is worse, cleaning stopped).

The `pd.notna()` guard prevents cases where a category received no submissions in one of the two weeks, which would produce `NaN` and crash the subtraction.

---

## 14. The Campus Heatmap

The heatmap maps submission density across a virtual 5×5 grid representing the campus. Each location (configured by the admin) is assigned grid coordinates (x_grid, y_grid) in the range 1–5.

### Aggregation

```python
grid = (
    df.groupby(["location_x", "location_y", "location"])
    .size()
    .reset_index(name="count")
)
heatmap = grid.to_dict("records")
```

This groups all submissions by their location's grid coordinates and counts them. The result is a list of `{location_x, location_y, location, count}` records. The frontend renders these as coloured cells in a CSS grid, with colour intensity proportional to count.

### Colour intensity mapping

```
count / max_count → 0.0 to 1.0 → maps to opacity/shade
```

Normalizing by `max_count` ensures the highest-frequency location is always the darkest, regardless of absolute numbers. This is called **min-max normalization to [0, 1]** and is a fundamental technique whenever displaying multiple values on a relative colour scale.

### Why 5×5?

Five by five gives 25 possible grid positions — enough to map a typical university campus with several buildings, labs, canteens, and outdoor areas, without becoming so fine-grained that most cells are empty. The grid is an abstraction: exact GPS coordinates are not needed and would constitute a privacy risk if precise location could identify which student was where.

---

## 15. Word Cloud Generation

A word cloud is a visual summary of term frequency in a corpus. More-frequent terms appear larger.

```python
from wordcloud import WordCloud

wc = WordCloud(
    width=900, height=380,
    background_color="white",
    color_func=_orange_color,    # returns random orange shades
    max_words=70,
    prefer_horizontal=0.75,
    collocations=False,
).generate(combined)
```

### What `generate()` does internally

1. Tokenizes the combined text
2. Counts word frequencies (simple term frequency, not TF-IDF)
3. Removes common English stopwords (its own built-in list)
4. Scales each word's font size proportional to its frequency
5. Places words using an optimized layout algorithm that avoids overlap

### `collocations=False`

By default, the wordcloud library detects bigrams (two-word phrases) and counts them separately. Setting `collocations=False` disables this and counts only unigrams, avoiding duplicates where "broken ac" and "ac" both appear large.

### Serving as a PNG

Python's `io.BytesIO` is used to render the word cloud to a PNG image in memory (no disk write) and stream it directly to the frontend as a binary HTTP response. The frontend creates a blob URL and displays it in an `<img>` tag. The `Cache-Control: max-age=300` header prevents re-fetching the image on every page interaction.

---

## 16. Pipeline Architecture

### Event-driven NLP (per submission)

When a student submits, FastAPI's `BackgroundTasks` triggers the NLP pipeline **after** returning the HTTP response to the student. This means:

1. Student receives the success screen immediately (< 100ms)
2. NLP runs in the background (takes 50–500ms depending on dataset size)
3. Next time the admin loads the dashboard, `process_pending()` catches any remaining unprocessed rows first

```python
@router.post("/suggestions")
def submit(data: SuggestionCreate, background_tasks: BackgroundTasks, ...):
    token = insert_to_db(data)
    background_tasks.add_task(process_new, token)   # non-blocking
    return {"token": token}
```

This is an example of the **producer–consumer pattern**: the HTTP endpoint (producer) writes a raw row to the DB and returns. The background task (consumer) enriches that row asynchronously.

### Batch NLP (on dashboard load)

`process_pending()` is called at the start of every admin dashboard or insights request:

```python
def process_pending() -> int:
    pending = db.get_unprocessed_suggestions()
    if not pending:
        return 0
    # ... NLP batch processing
```

This is a safety net: if the background task was missed (server restart, exception), the next admin page load will process all outstanding rows. It is idempotent — running it on an already-processed dataset does nothing.

### Clustering as on-demand batch

Clustering runs the full TF-IDF + K-Means pipeline on every call to the insights page:

```python
def run_clustering_pipeline() -> Dict:
    all_s = db.get_all_suggestions()
    if len(all_s) < 6:
        return {"scatter": [], "cluster_labels": {}}
    result = clustering.run_clustering(all_s)
    ...
```

This is acceptable for small datasets (< 5,000 submissions) because K-Means on 200 features × 1,000 rows takes well under 1 second. For production scale, the clustering result would be cached in Redis or recomputed on a schedule (e.g., every 15 minutes) rather than on every page load.

### Data flow diagram

```
Student Browser
     │
     │  POST /suggestions {category, location, text}
     ▼
FastAPI (Uvicorn)
     │
     ├─ Pydantic validation → bleach sanitize → rate-limit check
     ├─ uuid4 token → INSERT suggestions (processed=0)
     ├─ HTTP 200 → token to student          (synchronous)
     └─ BackgroundTask: process_new(token)   (asynchronous)
              │
              ├─ clean_text (NLTK)
              ├─ get_sentiment (TextBlob)
              ├─ extract_keywords (TF-IDF)
              └─ UPDATE suggestions (processed=1)

Admin Browser
     │
     │  GET /admin/dashboard
     ▼
FastAPI
     ├─ verify JWT
     ├─ process_pending()        ← catches any missed background tasks
     ├─ get_all_suggestions()
     └─ analytics.get_dashboard_data(suggestions)
              │
              ├─ Pandas groupby (category, location, week)
              ├─ Z-score anomaly on weekly counts
              ├─ sentiment delta (this week vs last)
              └─ return JSON → Recharts renders charts

Admin Browser
     │
     │  GET /admin/insights
     ▼
FastAPI
     ├─ verify JWT
     ├─ process_pending()
     ├─ get_all_suggestions()
     ├─ get_dashboard_data()     (reuses aggregations)
     ├─ get_top_priorities()     (sort by priority_score)
     └─ run_clustering_pipeline()
              │
              ├─ TF-IDF vectorize all text_clean
              ├─ K-Means (k=6, n_init=10)
              ├─ PCA (2 components)
              ├─ centroid → cluster labels
              └─ return scatter JSON → frontend renders scatter plot
```

---

## 17. Edge Cases and Robustness

### Cold start — fewer than 6 submissions

K-Means requires at least as many data points as clusters. With k=6, fewer than 6 submissions triggers an early return:

```python
if len(suggestions) < N_CLUSTERS:
    return {"updates": [], "scatter": [], "cluster_labels": {}}
```

The insights page handles `scatter: []` and `cluster_labels: {}` gracefully — it shows an empty chart with an explanatory message rather than crashing. All other pages (dashboard, analytics, trends) work from submission count 1.

### Empty vocabulary after text cleaning

If all submission texts consist entirely of stopwords (e.g., "I am the"), NLTK cleaning produces empty strings. TF-IDF's `fit_transform` on a list of empty strings raises:

```
ValueError: empty vocabulary; perhaps the documents only contain stop words
```

This is caught:

```python
try:
    X = vectorizer.fit_transform(texts)
except ValueError:
    return {"updates": [], "scatter": [], "cluster_labels": {}}
```

For per-submission keyword extraction, `extract_keywords` similarly returns `[[] for _ in texts]` when all texts are empty after filtering. The submission is stored with `keywords: "[]"` — not processed, not crashed.

### All-zero cluster centroids

If a cluster's centroid has all-zero weights (no term is distinctive for that cluster), the original code would return the last 3 alphabetically sorted vocabulary items as the label — meaningless and misleading. The current code guards against this:

```python
top_idx = [i for i in center.argsort()[-5:][::-1] if center[i] > 0][:3]
label = " / ".join(features[i] for i in top_idx) if top_idx else f"Cluster {c + 1}"
```

Only terms with `center[i] > 0` (actual positive centroid weight) are included. If none exist, the cluster falls back to a generic `"Cluster N"` label.

### Sentiment delta with missing weekly data

If a category had zero submissions last week (e.g., "Campus Life" received no feedback), computing `this_week_avg - last_week_avg` would subtract `NaN`. The `pd.notna()` guard skips this category's delta entirely:

```python
if pd.notna(tw) and pd.notna(lw):
    sentiment_delta[cat] = round(float(tw - lw), 3)
```

### Priority score for unprocessed submissions

`get_top_priorities()` filters to `processed == 1` rows only:

```python
df = df[df["processed"] == 1].sort_values("priority_score", ascending=False)
```

Unprocessed submissions have `priority_score = NULL`. Including them would cause `sort_values` to place nulls at an arbitrary position. Filtering them out ensures the priority list only contains fully-scored submissions.

---

## 18. Evaluation and Limitations

### How do you evaluate an unsupervised system?

Supervised ML has a clear metric: accuracy, F1, AUC. Unsupervised ML lacks ground truth labels. Echo's effectiveness cannot be measured with a simple number — instead, it is evaluated on:

**Silhouette Score** (implemented but not surfaced in the UI):
- Measures intra-cluster cohesion vs inter-cluster separation
- Score near +1 = tight, well-separated clusters
- Score near 0 = overlapping clusters (topics are similar)
- Score near −1 = points are in the wrong cluster

**Admin utility** (qualitative): Do the cluster labels correspond to recognizable campus issues? Do the priority scores surface issues that the admin independently knows are important? Do the anomaly alerts correspond to real events?

**Trend accuracy**: Compare linear regression forecasts to actual counts in subsequent weeks. R² above 0.6 suggests reasonable predictive power.

### Current limitations

| Limitation | Impact | Potential fix |
|---|---|---|
| TextBlob lexicon-based sentiment | Low accuracy on informal/Urdu-English mixed text | Fine-tune `cardiffnlp/twitter-roberta-base-sentiment` |
| k=6 fixed | May not fit all campus contexts | Add Elbow Method / Silhouette auto-selection |
| No stopword customization | Domain words like "university" are not removed | Let admin add domain-specific stopwords |
| Clustering re-runs on every insights load | Slow on large datasets | Cache clustering result; recompute on schedule |
| Linear regression ignores seasonality | Semester peaks/troughs not modelled | Add Fourier features or use FB Prophet |
| English NLTK stopwords only | Poor cleaning for non-English text | Add multilingual stopword support |
| Cluster size not in priority score | Large clusters (many students affected) not boosted | Run priority recalculation after clustering |
| No model persistence | K-Means re-fits from scratch every time | Serialize model with `joblib`; retrain periodically |

### What a production upgrade looks like

```
Current (Semester Project)          Production Upgrade
─────────────────────────────────   ──────────────────────────────────────
TextBlob polarity                →  Fine-tuned BERT sentiment
TF-IDF + K-Means k=6            →  BERTopic (neural topic modelling)
Z-score anomaly                  →  LSTM autoencoder anomaly detection
Linear regression forecast       →  Facebook Prophet (seasonal)
SQLite                           →  PostgreSQL (multi-campus)
In-process clustering            →  Celery task queue (async cluster jobs)
```

---

## 19. DS Curriculum Alignment Checklist

This section maps each component of Echo's pipeline to standard data science curriculum topics, for academic review purposes.

| DS Topic | Where Echo implements it | File |
|---|---|---|
| **Data Collection** | POST /suggestions — controlled vocab + free text | `br/routers/suggestions.py` |
| **Data Storage** | SQLite schema design, denormalized for analytics | `br/core/database.py` |
| **Data Cleaning** | NLTK: lowercase, punctuation strip, tokenize, stopword removal | `br/data_science/nlp.py` |
| **Exploratory Data Analysis** | Pandas groupby, value_counts, describe() on all fields | `br/data_science/analytics.py` |
| **Descriptive Statistics** | Mean, median, std, count per category/location/week | `br/data_science/analytics.py` |
| **Data Visualization** | Bar, line, pie (Recharts), heatmap, scatter, word cloud | `fr/components/charts/` |
| **Text Preprocessing** | Tokenization, stopword removal, regex cleaning | `br/data_science/nlp.py` |
| **NLP — Bag of Words** | TF-IDF is an extension of BoW with IDF weighting | `br/data_science/nlp.py` |
| **NLP — TF-IDF** | Per-submission keyword extraction, cluster vocabulary | `br/data_science/nlp.py`, `clustering.py` |
| **Sentiment Analysis** | TextBlob polarity + dead-band thresholding | `br/data_science/nlp.py` |
| **Unsupervised ML — Clustering** | K-Means (k=6, n_init=10) on TF-IDF vectors | `br/data_science/clustering.py` |
| **Dimensionality Reduction** | PCA (2 components) for 2D scatter visualization | `br/data_science/clustering.py` |
| **Statistical Anomaly Detection** | Z-score on weekly submission volume (threshold: 2σ) | `br/data_science/analytics.py` |
| **Time-Series Analysis** | Weekly aggregation, week-over-week change | `br/data_science/analytics.py` |
| **Forecasting / Regression** | OLS linear regression for 4-week volume forecast | `br/data_science/analytics.py` |
| **Feature Engineering** | Recency score, sentiment magnitude → priority score | `br/data_science/pipeline.py` |
| **Multi-factor Scoring** | Weighted composite priority score | `br/data_science/pipeline.py` |
| **Privacy / Ethics** | Structural anonymity, UUID4, no PII collection | `br/core/anonymizer.py`, `security.py` |
| **Pipeline Architecture** | ETL: ingest → clean → aggregate → cluster → visualize | `br/data_science/pipeline.py` |
| **Data Product Design** | Full admin dashboard + ML insights surfaced to end user | `fr/app/admin/` |
| **Edge Case Handling** | Cold start, empty vocabulary, all-zero centroid, NaN delta | `br/data_science/clustering.py`, `analytics.py` |
| **Evaluation** | Silhouette score concept, R² for forecast quality | This document + `br/data_science/clustering.py` |

---

*Echo was built as a complete end-to-end data science system — from raw student text to actionable institutional insights — using only open-source Python libraries and running entirely on a single machine.*
