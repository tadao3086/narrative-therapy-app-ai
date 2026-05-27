"use client";

import { useState, useEffect } from "react";
import styles from "./page.module.css";

type AppState = "home" | "settings" | "interview" | "loading" | "story";

export interface StoryData {
  title: string;
  catchphrase: string;
  synopsis: string;
  theme: string;
  characters: { name: string; desc: string }[];
  climax: string;
  ending: string;
}

const QUESTIONS = [
  {
    id: "fear",
    text: "今、あなたが一番「怖い」と感じていることは何ですか？",
    type: "select",
    options: [
      { value: "", label: "選択してください" },
      { value: "failure", label: "失敗して笑われること" },
      { value: "rejection", label: "本当の自分を出して拒絶されること" },
      { value: "trust", label: "誰かを信じて裏切られること" },
      { value: "custom", label: "その他（自由に入力）" }
    ]
  },
  {
    id: "facade",
    text: "その恐れを隠すために、普段どんな態度をとってしまいますか？",
    type: "select",
    options: [
      { value: "", label: "選択してください" },
      { value: "perfection", label: "完璧なふりをして隙を見せない" },
      { value: "cynical", label: "冷めたふりをして何にも期待しない" },
      { value: "clown", label: "道化を演じて本音をごまかす" },
      { value: "custom", label: "その他（自由に入力）" }
    ]
  },
  {
    id: "keyword",
    text: "今の気持ちを表す「キーワード」を一つ教えてください。",
    type: "text",
    placeholder: "例：空虚、焦り、透明人間、仮面"
  }
];

export default function Home() {
  const [appState, setAppState] = useState<AppState>("home");
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [storyData, setStoryData] = useState<StoryData | null>(null);
  
  const [apiKey, setApiKey] = useState("");
  const [tempApiKey, setTempApiKey] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    // 初回マウント時に localStorage から APIキーを取得
    const storedKey = localStorage.getItem("gemini_api_key");
    if (storedKey) {
      setApiKey(storedKey);
    }
  }, []);

  const handleStart = () => {
    if (!apiKey) {
      setAppState("settings");
    } else {
      setAppState("interview");
    }
  };

  const handleSaveApiKey = () => {
    if (tempApiKey.trim() === "") {
      setErrorMsg("APIキーを入力してください。");
      return;
    }
    localStorage.setItem("gemini_api_key", tempApiKey.trim());
    setApiKey(tempApiKey.trim());
    setErrorMsg("");
    setAppState("interview");
  };

  const handleClearApiKey = () => {
    localStorage.removeItem("gemini_api_key");
    setApiKey("");
    setTempApiKey("");
  };

  const handleAnswerChange = (val: string) => {
    const q = QUESTIONS[currentQuestionIdx];
    setAnswers(prev => ({ ...prev, [q.id]: val }));
  };

  const handleNextQuestion = () => {
    if (currentQuestionIdx < QUESTIONS.length - 1) {
      setCurrentQuestionIdx(prev => prev + 1);
    } else {
      generateStory();
    }
  };

  const generateStory = async () => {
    setAppState("loading");
    setErrorMsg("");

    try {
      const fear = answers.fear === "custom" ? answers.fear_custom || "漠然とした不安" :
                   answers.fear === "failure" ? "失敗して笑われること" :
                   answers.fear === "rejection" ? "本当の自分を出して拒絶されること" :
                   answers.fear === "trust" ? "誰かを信じて裏切られること" : answers.fear;
                   
      const facade = answers.facade === "custom" ? answers.facade_custom || "自分を偽る態度" :
                     answers.facade === "perfection" ? "完璧なふりをして隙を見せない" :
                     answers.facade === "cynical" ? "冷めたふりをして何にも期待しない" :
                     answers.facade === "clown" ? "道化を演じて本音をごまかす" : answers.facade;
                     
      const keyword = answers.keyword || "特になし";

      const systemInstruction = `あなたは「内省のエンタメ化」を体現する、世界最高峰のストーリーテラーであり心理療法士です。
物語の中心にある「傷」や「恐れ」を単なる弱点として扱うのではなく、「これまで主人公の心を守ってきた大切な鎧（生存戦略）」として肯定した上で、価値観の反転（パラダイムシフト）を起こす深いカタルシスを持つ童話を構築してください。

【主人公のコア（ユーザーの深層心理）】
- 一番恐れていること: ${fear}
- それを隠すための態度（鎧）: ${facade}
- 今の気持ちを表すキーワード: ${keyword}

【物語の構成骨格と絶対ルール】
1. **世界観の反転**: 主人公の「恐れ」が物理法則や社会のルールとして具現化された、少し残酷で美しいファンタジー世界を設定してください。
2. **テーマの深み（パラダイムシフト）**: テーマは薄っぺらい道徳や教訓（例:「勇気を出そう」）であっては絶対にいけません。「恐れや偽りの態度は、自分を守るための優しさだった」という肯定から入り、「でも、もうその鎧は脱いでも大丈夫だ」と気づく『価値観の反転』をテーマに設定してください。
3. **不思議な導き手と影**: 主人公の抑圧された本音を代弁する「導き手」と、かつての自分自身が肥大化したような「立ちはだかる影」を登場させてください。
4. **カタルシス（行動による描写）**: クライマックスでは、言葉で説明する（説教する）のではなく、主人公が「一番怖がっていた行動」を自ら選び取り、世界（景色や空気）が一変する描写（Show, don't tell）でカタルシスを生み出してください。
5. **余韻のある結末**: ラストシーンはすべてが解決したハッピーエンドではなく、傷を抱えたまま、それでも前を向く静かな余韻（キーワード「${keyword}」を美しく回収する描写）で締めくくってください。

指定されたJSONスキーマに従って、出力してください。`;

      const requestBody = {
        systemInstruction: {
          parts: [{ text: systemInstruction }]
        },
        contents: [
          { parts: [{ text: "上記の指示に従い、ストーリーを生成してください。" }] }
        ],
        generationConfig: {
          responseMimeType: "application/json",
          responseSchema: {
            type: "OBJECT",
            properties: {
              title: { type: "STRING", description: "映画のタイトル" },
              catchphrase: { type: "STRING", description: "心に刺さるキャッチコピー" },
              synopsis: { type: "STRING", description: "あらすじ（改行は\\nを使用すること）" },
              theme: { type: "STRING", description: "物語のテーマ" },
              characters: {
                type: "ARRAY",
                items: {
                  type: "OBJECT",
                  properties: {
                    name: { type: "STRING" },
                    desc: { type: "STRING" }
                  },
                  required: ["name", "desc"]
                }
              },
              climax: { type: "STRING", description: "クライマックスの描写（改行は\\nを使用すること）" },
              ending: { type: "STRING", description: "ラストシーンと余韻（改行は\\nを使用すること）" }
            },
            required: ["title", "catchphrase", "synopsis", "theme", "characters", "climax", "ending"]
          },
          temperature: 0.7
        }
      };

      const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error?.message || "ストーリーの生成に失敗しました。");
      }

      const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!text) {
        throw new Error("Geminiからテキストが返されませんでした。");
      }

      const storyData = JSON.parse(text);
      setStoryData(storyData);
      setAppState("story");

    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || "エラーが発生しました。");
      setAppState("interview");
    }
  };

  const handleReset = () => {
    setAppState("home");
    setCurrentQuestionIdx(0);
    setAnswers({});
    setStoryData(null);
    setErrorMsg("");
  };

  const isCurrentAnswerValid = () => {
    const q = QUESTIONS[currentQuestionIdx];
    const ans = answers[q.id];
    if (ans === "custom") {
      const customAns = answers[q.id + "_custom"];
      return customAns !== undefined && customAns.trim() !== "";
    }
    return ans !== undefined && ans.trim() !== "";
  };

  return (
    <main className={styles.main}>
      {appState === "home" && (
        <div className={styles.animateFadeIn}>
          <h1 className={styles.title}>Shadow Tale</h1>
          <p className={styles.subtitle}>
            あなたの心の奥にある傷や恐れを投影し、価値観が反転した世界で小さな一歩を踏み出す童話を生成します。
          </p>
          {errorMsg && <p style={{ color: "#ef4444", marginBottom: "1rem" }}>{errorMsg}</p>}
          <button className={styles.startButton} onClick={handleStart}>
            物語を紡ぐ
          </button>
          {apiKey && (
            <div style={{ marginTop: "1.5rem" }}>
              <button 
                onClick={handleClearApiKey}
                style={{ 
                  background: "transparent", 
                  border: "none", 
                  color: "var(--text-secondary)", 
                  textDecoration: "underline", 
                  cursor: "pointer",
                  fontSize: "0.9rem"
                }}
              >
                登録済みのAPIキーを解除する
              </button>
            </div>
          )}
        </div>
      )}

      {appState === "settings" && (
        <div className={`${styles.settingsContainer} glass-panel`}>
          <h2 className={styles.questionText}>Gemini APIキーの設定</h2>
          <p className={styles.settingsDescription}>
            このアプリは、Google Gemini APIを使用してあなただけの物語を生成します。
            APIキーはブラウザのローカルストレージにのみ保存され、サーバー等には記録されません。
          </p>
          <input
            type="password"
            className={styles.settingsInput}
            placeholder="AIzaSy..."
            value={tempApiKey}
            onChange={(e) => setTempApiKey(e.target.value)}
          />
          {errorMsg && <p style={{ color: "#ef4444", fontSize: "0.9rem" }}>{errorMsg}</p>}
          <button className={styles.settingsButton} onClick={handleSaveApiKey}>
            保存して始める
          </button>
        </div>
      )}

      {appState === "interview" && (
        <div className={styles.interviewContainer}>
          <div className={`${styles.questionCard} glass-panel`}>
            <span className={styles.questionNumber}>
              Question {currentQuestionIdx + 1} / {QUESTIONS.length}
            </span>
            <h2 className={styles.questionText}>
              {QUESTIONS[currentQuestionIdx].text}
            </h2>
            
            {errorMsg && (
              <div style={{ padding: "0.5rem", marginBottom: "1rem", backgroundColor: "rgba(239, 68, 68, 0.1)", border: "1px solid #ef4444", borderRadius: "0.5rem" }}>
                <p style={{ color: "#ef4444", fontSize: "0.9rem", margin: 0 }}>{errorMsg}</p>
              </div>
            )}
            
            {QUESTIONS[currentQuestionIdx].type === "select" ? (
              <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: "1rem" }}>
                <select 
                  className={styles.selectInput}
                  value={answers[QUESTIONS[currentQuestionIdx].id] || ""}
                  onChange={(e) => handleAnswerChange(e.target.value)}
                >
                  {QUESTIONS[currentQuestionIdx].options?.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
                {answers[QUESTIONS[currentQuestionIdx].id] === "custom" && (
                  <input
                    type="text"
                    className={`${styles.textInput} animate-fade-in`}
                    placeholder="自由に入力してください"
                    value={answers[QUESTIONS[currentQuestionIdx].id + "_custom"] || ""}
                    onChange={(e) => setAnswers(prev => ({ ...prev, [QUESTIONS[currentQuestionIdx].id + "_custom"]: e.target.value }))}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && isCurrentAnswerValid()) {
                        handleNextQuestion();
                      }
                    }}
                    autoFocus
                  />
                )}
              </div>
            ) : (
              <input 
                type="text"
                className={styles.textInput}
                placeholder={QUESTIONS[currentQuestionIdx].placeholder}
                value={answers[QUESTIONS[currentQuestionIdx].id] || ""}
                onChange={(e) => handleAnswerChange(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && isCurrentAnswerValid()) {
                    handleNextQuestion();
                  }
                }}
              />
            )}

            <div className={styles.actionRow}>
              <button 
                className={styles.nextButton}
                onClick={handleNextQuestion}
                disabled={!isCurrentAnswerValid()}
              >
                {currentQuestionIdx === QUESTIONS.length - 1 ? "生成する" : "次へ"}
              </button>
            </div>
          </div>
        </div>
      )}

      {appState === "loading" && (
        <div className={styles.loadingContainer}>
          <div className={styles.spinner}></div>
          <p className={styles.loadingText}>
            Geminiがあなたの感情を読み解き、新しい世界を構築しています...
          </p>
        </div>
      )}

      {appState === "story" && storyData && (
        <div className={`${styles.storyContainer} glass-panel animate-fade-in`}>
          <h2 className={styles.storyTitle}>{storyData.title}</h2>
          <p className={styles.catchphrase}>{storyData.catchphrase}</p>
          
          <h3 className={styles.sectionTitle}>あらすじ</h3>
          {storyData.synopsis.split('\n').map((paragraph, idx) => (
            <p key={`synopsis-${idx}`} className={styles.storyParagraph}>{paragraph}</p>
          ))}

          <h3 className={styles.sectionTitle}>物語のテーマ</h3>
          {storyData.theme.split('\n').map((paragraph, idx) => (
            <p key={`theme-${idx}`} className={styles.storyParagraph}>{paragraph}</p>
          ))}

          <h3 className={styles.sectionTitle}>主要キャラクター</h3>
          <div className={styles.characterList}>
            {storyData.characters.map((char, idx) => (
              <div key={idx} className={styles.characterItem}>
                <div className={styles.characterName}>{char.name}</div>
                <div className={styles.characterDesc}>{char.desc}</div>
              </div>
            ))}
          </div>

          <h3 className={styles.sectionTitle}>クライマックス</h3>
          {storyData.climax.split('\n').map((paragraph, idx) => (
            <p key={`climax-${idx}`} className={styles.storyParagraph}>{paragraph}</p>
          ))}

          <h3 className={styles.sectionTitle}>ラストシーン</h3>
          {storyData.ending.split('\n').map((paragraph, idx) => (
            <p key={`ending-${idx}`} className={styles.storyParagraph}>{paragraph}</p>
          ))}

          <button className={styles.resetButton} onClick={handleReset}>
            もう一度、自分の心と向き合う
          </button>
        </div>
      )}
    </main>
  );
}
