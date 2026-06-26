import { NextRequest, NextResponse } from "next/server";

const GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, topic, side, history, userMessage } = body;

    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return NextResponse.json({ error: "API key is missing" }, { status: 500 });
    }

    if (action === "chat") {
      const aiSide = side === "Təsdiq" ? "İnkar (Müxalifət)" : "Təsdiq (Hökumət)";
      const systemPrompt = `Sən rəsmi parlament debatında süni intellekt tərəfdaşsan.
Mövzu: "${topic}"
Sənin mövqeyin: ${aiSide}
İstifadəçinin mövqeyi: ${side}
Qaydalar: 
1. Arqumentlərini qısa, məntiqli və kəskin formada yaz.
2. Maksimum 3-4 cümlə ilə cavab ver.
3. Hər zaman opponentinin dediklərinə cavab ver (təkzib et) və öz yeni arqumentini gətir.
4. Çıxışın rəsmi, lakin sərt və inandırıcı olmalıdır. Təhqirə yol vermə.`;

      const formattedHistory = (history || []).map((msg: any) => ({
        role: msg.role === 'user' ? 'user' : 'model',
        parts: [{ text: msg.text }]
      }));

      if (userMessage) {
        formattedHistory.push({
          role: "user",
          parts: [{ text: userMessage }]
        });
      }

      const response = await fetch(`${GEMINI_API_URL}?key=${apiKey}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          system_instruction: { parts: [{ text: systemPrompt }] },
          contents: formattedHistory,
          generationConfig: { temperature: 0.7 }
        })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error?.message || "Gemini API error");
      }

      const aiText = data.candidates?.[0]?.content?.parts?.[0]?.text || "Cavab alına bilmədi.";
      return NextResponse.json({ text: aiText });
    }

    if (action === "analyze") {
      const systemPrompt = `Sən debat üzrə peşəkar hakim və analitiksən.
Mövzu: "${topic}"
İstifadəçinin mövqeyi: ${side}

Aşağıda istifadəçi və sənin (AI) aranızda keçən tam debat tarixçəsi verilib.
Tarixçə:
${(history || []).map((m: any) => `${m.role === 'user' ? 'İstifadəçi' : 'AI'}: ${m.text}`).join('\n')}

Səndən aşağıdakı JSON formatında yekun nəticə tələb olunur:
{
  "score": <0-dan 100-ə qədər tam ədəd>,
  "feedback": "<İstifadəçinin zəif və güclü tərəfləri, nitqi və arqumentasiyası haqqında detallı analiz. Azərbaycan dilində.>"
}
Diqqət: Yalnız düzgün formatlanmış JSON qaytar. Heç bir markdown backtick (\`\`\`) istifadə etmə.`;

      const response = await fetch(`${GEMINI_API_URL}?key=${apiKey}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ role: "user", parts: [{ text: systemPrompt }] }],
          generationConfig: { temperature: 0.2, responseMimeType: "application/json" }
        })
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error?.message || "Gemini API error");

      const resultText = data.candidates?.[0]?.content?.parts?.[0]?.text || "{}";
      const result = JSON.parse(resultText);

      return NextResponse.json(result);
    }

    if (action === "generate_topic") {
      const prompt = `Gənclər üçün rəsmi parlament debatında istifadə edilə biləcək aktual, maraqlı və fəlsəfi/sosial/siyasi/iqtisadi bir mövzu generasiya et. 
Sadecə mövzunun adını (1 cümlə) qaytar. Nümunə: Sosial şəbəkələr gənclərin inkişafına zərərlidir.`;
      
      const response = await fetch(`${GEMINI_API_URL}?key=${apiKey}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ role: "user", parts: [{ text: prompt }] }],
          generationConfig: { temperature: 0.9 }
        })
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error?.message || "Gemini API error");

      const topicText = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || "Müasir dövrdə texnologiya insanları daha da tənha edir.";
      return NextResponse.json({ topic: topicText });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });

  } catch (error: any) {
    console.error("Gemini API xətası:", error);
    return NextResponse.json({ error: error.message || "Xəta baş verdi" }, { status: 500 });
  }
}
