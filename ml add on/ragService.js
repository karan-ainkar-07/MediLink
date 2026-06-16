import { PineconeStore } from "@langchain/pinecone";
import { Pinecone } from "@pinecone-database/pinecone";
import { HuggingFaceInferenceEmbeddings } from "@langchain/community/embeddings/hf";
import { ChatGroq } from "@langchain/groq";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { StringOutputParser } from "@langchain/core/output_parsers";
import { RunnableSequence } from "@langchain/core/runnables";

// ── RAG Prompt ────────────────────────────────────────────────
const SYSTEM_PROMPT = `You are a helpful medical assistant for MediLink.
Answer the user's question using ONLY the context provided below.
If the answer is not in the context, say "I don't have enough information to answer that."
Keep answers clear, concise, and accurate.

Context:
{context}`;

let ragChain = null; // singleton — init once, reuse forever

export async function initRAG() {
  if (ragChain) return; // already initialized

  console.log("🌲 Initializing RAG pipeline...");

  const pc    = new Pinecone({ apiKey: process.env.PINECONE_API_KEY });
  const index = pc.index(process.env.PINECONE_INDEX_NAME);

  const embeddings = new HuggingFaceInferenceEmbeddings({
    apiKey: process.env.HF_API_KEY,
    model:  "sentence-transformers/all-mpnet-base-v2",
  });

  const vectorStore = await PineconeStore.fromExistingIndex(embeddings, {
    pineconeIndex: index,
  });

  const retriever = vectorStore.asRetriever({ k: 4 });

  const llm = new ChatGroq({
    apiKey:      process.env.GROQ_API_KEY,
    model:       "llama-3.1-8b-instant",
    temperature: 0,
  });

  const prompt = ChatPromptTemplate.fromMessages([
    ["system", SYSTEM_PROMPT],
    ["human", "{question}"],
  ]);

  ragChain = RunnableSequence.from([
    {
      context:  (input) => retriever.invoke(input.question).then(docs =>
                  docs.map(d => d.pageContent).join("\n\n")),
      question: (input) => input.question,
    },
    prompt,
    llm,
    new StringOutputParser(),
  ]);

  console.log("✅ RAG pipeline ready!");
}

export async function queryRAG(question) {
  if (!ragChain) await initRAG();
  return await ragChain.invoke({ question });
}
