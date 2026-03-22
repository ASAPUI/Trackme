const router = require('express').Router();
const auth = require('../middleware/auth');
const Transaction = require('../models/Transaction');

router.post('/chat', auth, async (req, res) => {
  try {
    const { messages } = req.body;
    const userId = req.user._id;

    // Pull live user data for AI context
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const dayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    const [allTxns, monthStats, dayStats, catBreakdown] = await Promise.all([
      Transaction.find({ user: userId }).sort({ date: -1 }).limit(15),
      Transaction.aggregate([
        { $match: { user: userId, date: { $gte: monthStart } } },
        { $group: { _id: '$type', total: { $sum: '$amount' } } }
      ]),
      Transaction.aggregate([
        { $match: { user: userId, date: { $gte: dayStart } } },
        { $group: { _id: '$type', total: { $sum: '$amount' } } }
      ]),
      Transaction.aggregate([
        { $match: { user: userId, type: 'expense', date: { $gte: monthStart } } },
        { $group: { _id: '$category', total: { $sum: '$amount' } } },
        { $sort: { total: -1 } },
        { $limit: 5 }
      ]),
    ]);

    const getVal = (arr, type) => arr.find(r => r._id === type)?.total || 0;
    const monthInc = getVal(monthStats, 'income'), monthExp = getVal(monthStats, 'expenses');
    const dayExp = getVal(dayStats, 'expense');
    const budget = req.user.monthlyBudget || 5000;

    const systemPrompt = `You are FlowAI, a smart personal finance assistant for FlowTrack app.
User: ${req.user.name} | Currency: ${req.user.currency || 'MAD'} | Monthly budget: ${budget} MAD

Current financial snapshot:
- This month: Income ${monthInc} MAD | Expenses ${monthExp} MAD | Balance ${monthInc - monthExp} MAD
- Today: Spent ${dayExp} MAD
- Budget usage: ${Math.round(monthExp / budget * 100)}%
- Top categories: ${catBreakdown.map(c => `${c._id}: ${c.total} MAD`).join(', ')}
- Recent 5 transactions: ${allTxns.slice(0,5).map(t => `${t.type} ${t.amount} MAD for "${t.description}"`).join(' | ')}

Be concise (2-4 sentences), warm, specific with numbers, and give actionable advice in ${req.user.currency || 'MAD'}.`;

    // Call Groq API (free) — fallback to Anthropic
    const groqKey = process.env.GROQ_API_KEY;
    let reply;

    if (groqKey) {
      const groqRes = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${groqKey}` },
        body: JSON.stringify({
          model: 'llama-3.1-70b-versatile',
          messages: [{ role: 'system', content: systemPrompt }, ...messages],
          max_tokens: 300,
          temperature: 0.7,
        })
      });
      const groqData = await groqRes.json();
      reply = groqData.choices?.[0]?.message?.content;
    }

    if (!reply) {
      // Fallback: smart rule-based response
      const lastMsg = messages[messages.length - 1]?.content?.toLowerCase() || '';
      if (lastMsg.includes('today') || lastMsg.includes('spend today'))
        reply = `Today you've spent ${dayExp} MAD so far.`;
      else if (lastMsg.includes('budget'))
        reply = `You've used ${Math.round(monthExp/budget*100)}% of your ${budget} MAD budget this month (${monthExp} MAD spent).`;
      else if (lastMsg.includes('balance'))
        reply = `This month your balance is ${monthInc - monthExp} MAD (earned ${monthInc} MAD, spent ${monthExp} MAD).`;
      else
        reply = `This month: earned ${monthInc} MAD, spent ${monthExp} MAD, balance ${monthInc-monthExp} MAD. Budget at ${Math.round(monthExp/budget*100)}%. ${catBreakdown[0] ? `Top spending: ${catBreakdown[0]._id} (${catBreakdown[0].total} MAD).` : ''}`;
    }

    res.json({ reply });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

module.exports = router;
