export interface LearningTipItem {
  id: number;
  shortTip: string;
  fullExplanation: string;
  citation: string;
  moreInfoUrl: string;
  theme: 'memory' | 'focus' | 'active' | 'understanding' | 'strategy';
}

export const LEARNING_TIPS: LearningTipItem[] = [
  {
    id: 1,
    shortTip: 'Try to recall information without notes – it strengthens long-term memory.',
    fullExplanation:
      'Based on the study by H. L. Roediger and J. D. Karpicke, recalling information without notes is not merely a way to check knowledge, but a powerful learning tool known as the "testing effect." The researchers found that actively retrieving information from memory creates stronger neural connections in the brain than repeatedly reading the same material. Although studying with notes provides a short-term sense of success, it fosters an illusion of competence that fades quickly. Research data shows that after one week, individuals who practiced retrieval without assistance retained significantly more information than those who simply read it. This process forces the brain to work more intensely, which directly slows down forgetting and supports long-term retention.',
    citation:
      'Roediger, H. L., & Karpicke, J. D. (2006). Test-enhanced learning: Taking memory tests improves long-term retention. Psychological Science, 17(3), 249–255.',
    moreInfoUrl: 'https://doi.org/10.1111/j.1467-9280.2006.01693.x',
    theme: 'memory',
  },
  {
    id: 2,
    shortTip: 'Switching between topics helps you learn more effectively than focusing on just one.',
    fullExplanation:
      'According to the systematic review by Dunlosky et al. (2013), interleaving topics is more effective than blocked practice, where one focuses on a single subject for a long time. While one-topic study may feel productive, it often creates a false sense of mastery. Mixing tasks or topics forces the brain to keep identifying the problem type and choosing the right strategy. This extra effort improves long-term retention and helps you apply knowledge more effectively in new situations.',
    citation:
      'Dunlosky, J., Rawson, K. A., Marsh, E. J., Nathan, M. J., & Willingham, D. T. (2013). Improving students’ learning with effective learning techniques. Psychological Science in the Public Interest, 14(1), 4–58.',
    moreInfoUrl: 'https://doi.org/10.1177/1529100612453266',
    theme: 'strategy',
  },
  {
    id: 3,
    shortTip: 'If it’s hard to start learning, commit to just 10 minutes – it’s often enough to build momentum.',
    fullExplanation:
      'The biggest hurdle in learning is often resistance to starting. Research on willpower and behavioral activation suggests that a very small starting goal reduces resistance and makes it easier to begin. Once you start, momentum builds naturally and the task usually feels less difficult than expected. A 10-minute start is often enough to move from procrastination into action.',
    citation:
      'Baumeister, R. F., & Tierney, J. (2011). Willpower: Rediscovering the greatest human strength.',
    moreInfoUrl: 'https://www.penguinrandomhouse.com/books/307904/willpower-by-roy-f-baumeister-and-john-tierney/',
    theme: 'focus',
  },
  {
    id: 4,
    shortTip: 'Explaining a topic to someone else helps you understand it more deeply.',
    fullExplanation:
      'Research shows that when we explain something to someone else, or even out loud to ourselves, the brain is forced to organize information logically. Chi and colleagues found that self-explanation improves understanding because it helps reveal knowledge gaps and strengthens connections between new and existing ideas. Explaining transforms passive reading into active thinking.',
    citation:
      'Chi, M. T. H., de Leeuw, N., Chiu, M. H., & LaVancher, C. (1994). Eliciting self-explanations improves understanding. Cognitive Science, 18(3), 439–477.',
    moreInfoUrl: 'https://doi.org/10.1207/s15516709cog1803_1',
    theme: 'understanding',
  },
  {
    id: 5,
    shortTip: 'Space out your study sessions – it helps information stick longer.',
    fullExplanation:
      'Our brains naturally forget unused information, which is why cramming works only briefly. Research on the spacing effect shows that spreading study over time improves long-term retention. When you revisit material after a gap, the brain has to work harder to retrieve it, and that extra effort strengthens memory pathways. This makes spaced learning far more effective than trying to learn everything in one sitting.',
    citation:
      'Cepeda, N. J., Pashler, H., Vul, E., Wixted, J. T., & Rohrer, D. (2006). Distributed practice in verbal recall tasks: A review and quantitative synthesis. Psychological Bulletin, 132(3), 354–380.',
    moreInfoUrl: 'https://doi.org/10.1037/0033-2909.132.3.354',
    theme: 'memory',
  },
];