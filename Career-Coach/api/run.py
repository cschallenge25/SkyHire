import streamlit as st
import matplotlib.pyplot as plt
from sentence_transformers import SentenceTransformer, util
import PyPDF2
import re
from collections import Counter
import nltk
from nltk.corpus import stopwords
from nltk.tokenize import word_tokenize
from nltk.stem import WordNetLemmatizer
import pandas as pd
import io

# ---- NLTK resources ----
nltk.download("punkt")
nltk.download("stopwords")
nltk.download("wordnet")

# ---- Page setup ----
st.set_page_config(
    page_title="Resume Job Match Pro",
    page_icon="📄",
    layout="wide",
    initial_sidebar_state="expanded"
)

# ---- Hero Section ----
st.markdown(
    """
    <div style="background-color:#0077B5; padding:50px; border-radius:10px; color:white; text-align:center">
        <h1 style="font-size:48px;">📄 Resume Job Match Pro</h1>
        <p style="font-size:20px; max-width:800px; margin:auto;">
            Upload your resume and paste a job description to see how well they match.
            Powered by <b>semantic analysis</b> for better accuracy.
        </p>
    </div>
    """,
    unsafe_allow_html=True
)

st.write("")

# ---- How it Works Section ----
st.markdown("## How it works")
col1, col2, col3 = st.columns(3)

with col1:
    st.image("https://img.icons8.com/ios-filled/100/0077B5/upload.png", width=80)
    st.markdown("*1. Upload your resume (PDF)*")
    st.write("Your CV is read and analyzed automatically.")

with col2:
    st.image("https://img.icons8.com/ios-filled/100/0077B5/text-file.png", width=80)
    st.markdown("*2. Paste the job description*")
    st.write("Provide the job description to match against your CV.")

with col3:
    st.image("https://img.icons8.com/ios-filled/100/0077B5/checkmark.png", width=80)
    st.markdown("*3. Analyze & get results*")
    st.write("See your match score, keyword analysis, and tips.")

st.write("---")

# ---- Sidebar ----
with st.sidebar:
    st.header("About")
    st.info(
        """
        This tool helps you:
        - Measure how your resume matches a job description
        - Identify key job keywords
        - Suggest improvements to optimize your CV
        """
    )

    st.header("Instructions")
    st.write(
        """
        1. Upload your resume (PDF)
        2. Paste the job description
        3. Click *Analyze Match*
        4. Review score, keyword analysis, and tips
        """
    )

# ---- Helper functions ----
lemmatizer = WordNetLemmatizer()


def extract_text_from_pdf(uploaded_file):
    try:
        pdf_reader = PyPDF2.PdfReader(uploaded_file)
        text = ""
        for page in pdf_reader.pages:
            page_text = page.extract_text()
            if page_text:
                text += page_text
        return text
    except Exception as e:
        st.error(f"Error reading PDF: {e}")
        return ""


def clean_text(text):
    text = text.lower()
    text = re.sub(r'[^a-zA-Z\s]', '', text)
    return re.sub(r'\s+', ' ', text).strip()


def remove_stopwords(text):
    stop_words = set(stopwords.words('english'))
    words = word_tokenize(text)
    words = [lemmatizer.lemmatize(w) for w in words if w not in stop_words]
    return " ".join(words)


def extract_keywords(text, num_keywords=10):
    words = word_tokenize(text)
    words = [w for w in words if len(w) > 2]
    word_freq = Counter(words)
    return [w for w, _ in word_freq.most_common(num_keywords)]


def match_keywords(resume_text, job_text, num_keywords=10):
    job_keywords = extract_keywords(job_text, num_keywords)
    resume_keywords = set(word_tokenize(resume_text))
    present = [w for w in job_keywords if w in resume_keywords]
    missing = [w for w in job_keywords if w not in resume_keywords]
    return present, missing


def download_report(score, present, missing):
    df = pd.DataFrame({
        "Keyword": present + missing,
        "Status": ["Present"] * len(present) + ["Missing"] * len(missing)
    })
    df.loc[-1] = ["Overall Match Score", f"{score:.2f}%"]
    df.index = df.index + 1
    df = df.sort_index()

    buffer = io.BytesIO()
    df.to_csv(buffer, index=False)
    buffer.seek(0)
    return buffer


# ---- Load Model ----
@st.cache_resource
def load_model():
    return SentenceTransformer("all-MiniLM-L6-v2")


with st.spinner("Downloading NLP model (first run may take a minute)..."):
    model = load_model()


# ---- Main App ----
def main():
    st.markdown("## Get Started")
    st.info("Upload your resume to start the analysis!")

    uploaded_file = st.file_uploader("Upload your resume (PDF)", type=['pdf'])
    job_description = st.text_area("Paste the job description", height=200)

    if st.button("Analyze Match"):

        if not uploaded_file:
            st.warning("Please upload your resume")
            return

        if not job_description:
            st.warning("Please paste the job description")
            return

        with st.spinner("Analyzing your resume..."):
            resume_text = extract_text_from_pdf(uploaded_file)
            if not resume_text:
                st.error("Could not extract text from PDF. Please try another PDF.")
                return

        # Clean text
        resume_clean = remove_stopwords(clean_text(resume_text))
        job_clean = remove_stopwords(clean_text(job_description))

        # ---- Semantic similarity ----
        resume_emb = model.encode(resume_clean, convert_to_tensor=True)
        job_emb = model.encode(job_clean, convert_to_tensor=True)
        similarity_score = util.cos_sim(resume_emb, job_emb).item() * 100

        # ---- Fit level ----
        if similarity_score < 40:
            message = "⚠ Low Fit: Consider improving your CV for this job"
            color = "#ff4b4b"
        elif similarity_score < 70:
            message = "ℹ Good Fit: Your CV aligns fairly well"
            color = "#ffa726"
        else:
            message = "✅ Excellent Fit: This job suits you very well!"
            color = "#0f9d58"

        # ---- Display score ----
        st.markdown("## Match Score")
        col1, col2 = st.columns([2, 1])
        col1.metric("Match Score", f"{similarity_score:.2f}%")
        col2.markdown(f"<h3 style='color:{color}'>{message}</h3>", unsafe_allow_html=True)

        # ---- Gauge chart ----
        fig, ax = plt.subplots(figsize=(6, 0.6))
        ax.barh([0], [similarity_score], color=color)
        ax.set_xlim(0, 100)
        ax.set_yticks([])
        ax.set_xlabel("Match Percentage")
        ax.set_title("Resume Job Match")
        st.pyplot(fig)

        # ---- Keywords ----
        present, missing = match_keywords(resume_clean, job_clean)

        st.markdown("## Keyword Analysis")
        st.success("🔹 Keywords present: " + (", ".join(present) if present else "None"))
        st.warning("🔹 Keywords missing: " + (", ".join(missing) if missing else "None"))

        if similarity_score < 70:
            st.info("💡 Tip: Include more keywords from the job description in your CV to increase match score.")

        # ---- Download CSV ----
        csv_file = download_report(similarity_score, present, missing)
        st.download_button(
            "📥 Download CSV Report",
            csv_file,
            file_name="resume_job_match_report.csv",
            mime="text/csv"
        )


# ---- Run App ----
if __name__ == "__main__":
    main()
