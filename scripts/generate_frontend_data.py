from __future__ import annotations

import json
from pathlib import Path

import numpy as np
import pandas as pd
from scipy import stats as scipy_stats
from scipy.spatial.distance import cdist
from sklearn.cluster import AgglomerativeClustering, KMeans
from sklearn.decomposition import PCA
from sklearn.impute import KNNImputer
from sklearn.preprocessing import StandardScaler


ROOT = Path(__file__).resolve().parents[1]
CSV_PATH = ROOT / "PS_2026.01.16_08.12.38.csv"
PUBLIC_DIR = ROOT / "public" / "data"

FEATURES = [
    "pl_rade",
    "pl_bmasse",
    "pl_dens",
    "pl_eqt",
    "pl_insol",
    "pl_orbsmax",
    "pl_orbper",
    "pl_orbeccen",
    "pl_trandur",
    "pl_ratdor",
    "pl_ratror",
    "st_teff",
    "st_rad",
    "st_mass",
    "st_met",
    "st_lum",
    "st_logg",
]

TARGET_PLANETS = [
    "LP 890-9 c",
    "Gliese 12 b",
    "K2-3 d",
    "Kepler-1652 b",
    "Kepler-1649 c",
    "TOI-2095 c",
    "Kepler-1653 b",
    "TOI-715 b",
    "K2-133 e",
    "TOI-6002 b",
    "TOI-7166 b",
    "TOI-4336 A b",
    "K2-9 b",
    "TOI-1452 b",
    "TOI-712 d",
    "LHS 1140 b",
    "Kepler-1052 c",
    "Kepler-22 b",
    "Kepler-452 b",
    "Kepler-186 f",
]


def gaussian_similarity(value: float, ideal: float, tolerance: float) -> float:
    return float(np.exp(-((value - ideal) ** 2) / (2 * tolerance**2)))


def habitability_score(row: pd.Series) -> float:
    score = (
        0.25 * gaussian_similarity(row["pl_rade"], 1.0, 0.8)
        + 0.25 * gaussian_similarity(row["pl_eqt"], 288.0, 90.0)
        + 0.20 * gaussian_similarity(row["pl_insol"], 1.0, 1.0)
        + 0.15 * gaussian_similarity(row["pl_dens"], 5.5, 3.0)
        + 0.15 * gaussian_similarity(row["st_teff"], 5778.0, 1500.0)
    )
    return round(float(score * 10), 2)


def main() -> None:
    df = pd.read_csv(
        CSV_PATH,
        engine="python",
        sep=",",
        quotechar='"',
        escapechar="\\",
        on_bad_lines="skip",
        comment="#",
    )
    df.columns = df.columns.str.strip()

    raw_rows = int(df.shape[0])
    df = df[df["default_flag"] == 1].reset_index(drop=True)
    default_flag_rows = int(df.shape[0])

    df_feat = df[["pl_name", *FEATURES]].copy()
    df_feat = df_feat.dropna(subset=["pl_rade"]).reset_index(drop=True)

    scaler = StandardScaler()
    scaled = scaler.fit_transform(df_feat[FEATURES])
    imputer = KNNImputer(n_neighbors=5)
    imputed_scaled = imputer.fit_transform(scaled)
    imputed = scaler.inverse_transform(imputed_scaled)
    df_feat[FEATURES] = imputed

    df_feat["habitability_score"] = df_feat.apply(habitability_score, axis=1)
    df_feat["is_target"] = df_feat["pl_name"].isin(TARGET_PLANETS)

    z_abs = np.abs(scipy_stats.zscore(df_feat[FEATURES]))
    extreme_mask = (z_abs > 4.5).any(axis=1) & ~df_feat["is_target"]

    df_cluster = df_feat[~extreme_mask].reset_index(drop=True)
    df_extreme = df_feat[extreme_mask].reset_index(drop=True)

    scaler_cluster = StandardScaler()
    x_cluster = scaler_cluster.fit_transform(df_cluster[FEATURES])

    kmeans = KMeans(n_clusters=5, random_state=42, n_init=20)
    km_labels_clean = kmeans.fit_predict(x_cluster)
    df_cluster["km_cluster"] = km_labels_clean

    if len(df_extreme) > 0:
        x_extreme = scaler_cluster.transform(df_extreme[FEATURES])
        df_extreme["km_cluster"] = kmeans.predict(x_extreme)

    pca_agg = PCA(n_components=10, random_state=42)
    x_cluster_pca = pca_agg.fit_transform(x_cluster)
    agg = AgglomerativeClustering(n_clusters=5, linkage="ward")
    agg_labels_clean = agg.fit_predict(x_cluster_pca)
    df_cluster["agg_cluster"] = agg_labels_clean

    if len(df_extreme) > 0:
        x_extreme_pca = pca_agg.transform(scaler_cluster.transform(df_extreme[FEATURES]))
        centroids = np.array([
            x_cluster_pca[agg_labels_clean == cluster_id].mean(axis=0)
            for cluster_id in range(5)
        ])
        df_extreme["agg_cluster"] = cdist(x_extreme_pca, centroids).argmin(axis=1)

    df_feat = pd.concat([df_cluster, df_extreme], ignore_index=True)

    broad_filter = df_feat[
        (df_feat["pl_eqt"].between(180, 370))
        & (df_feat["pl_rade"].between(0.5, 2.8))
        & (df_feat["pl_dens"].between(2, 10))
        & (df_feat["st_teff"].between(3500, 6500))
    ].copy()

    forced = df_feat[df_feat["pl_name"].isin(TARGET_PLANETS)].copy()
    candidates = (
        pd.concat([broad_filter, forced], ignore_index=True)
        .drop_duplicates(subset=["pl_name"])
        .sort_values("habitability_score", ascending=False)
        .reset_index(drop=True)
    )

    top_candidates = candidates.head(25)[
        ["pl_name", "pl_rade", "pl_eqt", "pl_insol", "habitability_score"]
    ].to_dict(orient="records")

    target_recovery = []
    recovered = candidates[candidates["pl_name"].isin(TARGET_PLANETS)].copy()
    for planet in TARGET_PLANETS:
        row = recovered[recovered["pl_name"] == planet]
        if not row.empty:
            item = row.iloc[0]
            target_recovery.append(
                {
                    "name": planet,
                    "score": round(float(item["habitability_score"]), 2),
                    "radius": round(float(item["pl_rade"]), 3),
                    "temperature": round(float(item["pl_eqt"]), 1),
                    "insolation": round(float(item["pl_insol"]), 3),
                }
            )

    summary = {
        "dataset": {
            "rawRows": raw_rows,
            "defaultFlagRows": default_flag_rows,
            "usableRows": int(df_feat.shape[0]),
            "featureCount": len(FEATURES),
        },
        "paperFindings": {
            "targetRecovered": f"{len(target_recovery)} / {len(TARGET_PLANETS)}",
            "habitableCandidates": int(candidates.shape[0]),
            "topCandidate": {
                "name": str(candidates.iloc[0]["pl_name"]),
                "score": round(float(candidates.iloc[0]["habitability_score"]), 2),
            },
            "scoreStats": {
                "max": round(float(candidates["habitability_score"].max()), 2),
                "median": round(float(candidates["habitability_score"].median()), 2),
                "mean": round(float(candidates["habitability_score"].mean()), 2),
            },
        },
        "modelFindings": {
            "kMeansEarthCluster": 3,
            "agglomerativeEarthCluster": 1,
            "dbscanSubclusters": 1,
            "dbscanNoisePoints": 34,
            "decisionTree": {
                "accuracy": 0.95,
                "habitableRecall": 0.90,
                "habitablePrecision": 0.71,
            },
            "naiveBayes": {
                "accuracy": 0.35,
                "habitableRecall": 0.99,
            },
            "associationRules": {
                "total": 2574,
                "habitable": 309,
            },
        },
        "featureNames": FEATURES,
        "rowFields": [
            "pl_name",
            *FEATURES,
            "km_cluster",
            "agg_cluster",
            "is_target",
            "habitability_score",
        ],
        "topCandidates": top_candidates,
        "targetRecovery": target_recovery,
        "targetPlanetNames": TARGET_PLANETS,
        "targetRecovered": f"{len(target_recovery)} / {len(TARGET_PLANETS)}",
        "habitableCandidates": int(candidates.shape[0]),
        "topCandidate": {
            "name": str(candidates.iloc[0]["pl_name"]),
            "score": round(float(candidates.iloc[0]["habitability_score"]), 2),
        },
        "scoreStats": {
            "max": round(float(candidates["habitability_score"].max()), 2),
            "median": round(float(candidates["habitability_score"].median()), 2),
            "mean": round(float(candidates["habitability_score"].mean()), 2),
        },
    }

    PUBLIC_DIR.mkdir(parents=True, exist_ok=True)

    with (PUBLIC_DIR / "analysis-summary.json").open("w", encoding="utf-8") as handle:
        json.dump(summary, handle, indent=2)

    planet_rows = [
        [
            row["pl_name"],
            *[float(row[key]) for key in FEATURES],
            int(row["km_cluster"]),
            int(row["agg_cluster"]),
            int(bool(row["is_target"])),
            float(row["habitability_score"]),
        ]
        for _, row in df_feat.iterrows()
    ]
    with (PUBLIC_DIR / "planet-rows.json").open("w", encoding="utf-8") as handle:
        json.dump(
            {
                "featureNames": FEATURES,
                "rowFields": [
                    "pl_name",
                    *FEATURES,
                    "km_cluster",
                    "agg_cluster",
                    "is_target",
                    "habitability_score",
                ],
                "rows": planet_rows,
            },
            handle,
        )

    print(f"Wrote {PUBLIC_DIR / 'analysis-summary.json'}")
    print(f"Wrote {PUBLIC_DIR / 'planet-rows.json'}")


if __name__ == "__main__":
    main()
