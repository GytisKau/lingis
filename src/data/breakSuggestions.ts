export type BreakLength = 5 | 10 | 15 | 20 | 30;
export type BreakTypeKey = 'recharge' | 'stress' | 'focus' | 'nap';

export interface BreakTypeDefinition {
  key: BreakTypeKey;
  title: string;
  description: string;
  suggestions: Partial<Record<BreakLength, string[]>>;
}

export const BREAK_TYPES: BreakTypeDefinition[] = [
  {
    key: 'recharge',
    title: 'Recharge your energy',
    description:
      'Activities that help your body wake up and regain energy through light movement. This can include stretching, simple exercises, or short walks indoors or outdoors. Ideal when you feel physically tired, stiff, or low on energy.',
    suggestions: {
      5: [
        'Do quick stretches for your neck, shoulders, back, and arms to release tension from sitting.',
        'Walk around the room, hallway, or nearby space to get your body moving.',
        'Try light movements like squats, stretches, or arm exercises.'
      ],
      10: [
        'Take a slow 10-minute walk to refresh your body.',
        'Do full-body stretching, focusing on your neck, shoulders, and back.'
      ],
      15: [
        'Go for a relaxed walk outside to refresh both body and mind.',
        'Do a longer stretching or mobility routine to reduce physical tension.'
      ],
      20: [
        'Take a calm walk or do light physical activity to wake up your body.'
      ],
      30: [
        'Go for a relaxed or moderate-paced walk to reduce fatigue from sitting.',
        'Choose light movement that refreshes you without making you tired.'
      ]
    }
  },
  {
    key: 'stress',
    title: 'Reduce stress',
    description:
      'Calming activities designed to lower tension and help you relax. This includes slow breathing, quiet pauses, and meditation practices that ease your mind and reduce emotional strain.',
    suggestions: {
      5: [
        'Take a few minutes to breathe slowly and calmly, focusing only on your inhale and exhale.',
        'Close your eyes and sit in silence for a moment, stepping away from screens and studying.'
      ],
      10: [
        'Practice slow, steady breathing to calm your mind and reduce tension.',
        'Try a short meditation or guided relaxation.'
      ],
      15: [
        'Spend time on meditation, breathing exercises, or another calming practice.'
      ],
      20: [
        'Spend time on longer breathing or meditation exercises.',
        'Rest in silence, away from screens and distractions.'
      ],
      30: [
        'Practice breathing, meditation, or another relaxing activity.',
        'Rest without screens or noise, focusing on calm and recovery.'
      ]
    }
  },
  {
    key: 'focus',
    title: 'Restore focus',
    description:
      'Breaks that help your mind reset and restore concentration. These activities reduce screen time, limit distractions, and may include quiet time or being in a natural environment to help you refocus.',
    suggestions: {
      5: [
        'Avoid screens and let your eyes rest by looking into the distance or out a window.',
        'Spend a few minutes without your phone, music, or distractions to give your mind a reset.'
      ],
      10: [
        'If possible, step outside or change your environment.',
        'Stay away from your phone and computer to give your brain a break from information overload.'
      ],
      15: [
        'Be outside or near nature to recover from intense concentration.',
        'Step away from screens and noise to prepare for your next session.',
        'Spend time near greenery—trees, grass, or plants—and just relax.'
      ],
      20: [
        'Walk without your phone or interruptions to let your mind unwind.',
        'If possible, spend time in a natural environment.',
        'Sit or lie down with your eyes closed (without falling asleep) to reduce fatigue.'
      ],
      30: [
        'Spend 20–30 minutes outside or in a green environment.',
        'Walk at an easy pace without your phone to rest both your body and mind.'
      ]
    }
  },
  {
    key: 'nap',
    title: 'Quick nap',
    description:
      'Short rest options focused on recovery through sleep or deep relaxation. This can be a light nap or simply resting with your eyes closed to reduce fatigue and recharge mentally.',
    suggestions: {
      20: [
        'Take a 10–15 minute nap, leaving a few minutes to wake up and reset before your next session.'
      ],
      30: [
        'Take a 10–20 minute nap, and use the remaining time to wake up slowly, hydrate, and prepare to return.'
      ]
    }
  }
];

export function getBreakMinutesFromStudy(studyMinutes: number): BreakLength {
  switch (studyMinutes) {
    case 10:
      return 5;
    case 20:
      return 10;
    case 30:
      return 15;
    case 60:
      return 20;
    case 90:
      return 30;
    default:
      return 5;
  }
}