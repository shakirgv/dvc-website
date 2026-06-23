import { NextResponse } from 'next/server';

const GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent";

export async function POST(req: Request) {
  try {
    const { history, currentMessage, isEvaluation } = await req.json();

    const apiKey = process.env.GEMINI_API_KEY;
    
    if (!apiKey) {
      return NextResponse.json(
        { error: "API açarı tapılmadı (.env.local faylını yoxlayın)" },
        { status: 500 }
      );
    }

    let systemPrompt = "Sən peşəkar debatçısan. DVC (Vətəndaş Cəmiyyətində Debat) qaydaları ilə istifadəçiyə qarşı arqumentlər irəli sürürsən. Qısa, sərt, məntiqli və Azərbaycan dilində danış.";

    if (isEvaluation) {
      systemPrompt = "Sən peşəkar debat hakimisən. İndi 3 raundluq debat bitdi. İstifadəçinin irəli sürdüyü arqumentləri Ritorika, Məntiq və Struktur olmaqla 3 kateqoriya üzrə qiymətləndirib, yekun bal (0-100) verməlisən. Cavabın rəsmi və konstruktiv olmalıdır.";
    }

    const formattedHistory = history.map((msg: any) => ({
      role: msg.role === 'user' ? 'user' : 'model',
      parts: [{ text: msg.text }]
    }));

    // Add current user message
    if (currentMessage) {
      formattedHistory.push({
        role: "user",
        parts: [{ text: currentMessage }]
      });
    }

    const response = await fetch(`${GEMINI_API_URL}?key=${apiKey}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        system_instruction: {
          parts: [{ text: systemPrompt }]
        },
        contents: formattedHistory
      })
    });

    const data = await response.json();

    if (!response.ok) {
      // Return a simulated response if API fails (useful if provided key is a mock/placeholder)
      console.error("Gemini API Error:", data);
      return NextResponse.json({
        reply: isEvaluation 
          ? "API xətası baş verdi, lakin mock olaraq deyə bilərəm ki: Məntiqiniz 80/100, Ritorika 70/100, Struktur 85/100." 
          : "Təəssüf ki, API açarında problem var. Lakin mən sizin arqumentinizlə qismən razılaşıram, gəlin başqa prizmadan baxaq."
      });
    }

    const aiText = data.candidates?.[0]?.content?.parts?.[0]?.text || "Cavab alına bilmədi.";
    return NextResponse.json({ reply: aiText });

  } catch (error) {
    console.error("Gemini Route Error:", error);
    return NextResponse.json({ error: "Daxili server xətası" }, { status: 500 });
  }
}
