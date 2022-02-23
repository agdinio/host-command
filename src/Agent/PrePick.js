const Colors = {
  Black: '#FFFFFF',
  Blue: '#18c5ff',
  Green: '#2fc12f',
  Red: '#ff1a1a',
  Yellow: '#ffb600',
}

module.exports = {
  pullTeams: () => {
    return new Promise((resolve, reject) => {
      resolve({
        teams: [
          {
            id: 1,
            teamName: 'Patriots',
            initial: 'P',
            iconTopColor: '#be0824',
            iconBottomColor: '#0e264b',
            score: 0,
          },
          {
            id: 2,
            teamName: 'Rams',
            initial: 'R',
            iconTopColor: '#fad11f',
            iconBottomColor: '#182687',
            score: 0,
          },
        ],
      })
    })
  },
  pullQuestions: () => {
    return Promise.resolve({
      data: {
        questions: [
          {
            prepickSequence: 1,
            id: 1,
            title: 'Who',
            titleColor: Colors.Black,
            labels: [
              { sequence: 1, value: 'wins the', color: Colors.Black },
              { sequence: 2, value: 'coin toss', color: Colors.Green },
              { sequence: 3, value: '?', color: Colors.Black },
            ],
            choiceType: 'AB',
            choices: ['Jaguars', 'Patriots'],
            background: 'playalong-awaiting.jpg',
            points: 2000,
            tokens: 50,
            forTeam: {},
            shortHand: 'COIN TOSS',
            correctAnswer: 'Jaguars',
            type: 'PrePick',
          },
          {
            prepickSequence: 2,
            id: 2,
            title: 'MOST PASSES',
            titleColor: Colors.Black,
            labels: [
              {
                sequence: 1,
                value: 'What team will complete the most passes?',
                color: Colors.Black,
              },
            ],
            choiceType: 'AB',
            choices: ['Jaguars', 'Patriots'],
            background: 'playalong-penaltyteama.jpg',
            points: 2000,
            tokens: 50,
            shortHand: 'MOST PASSES',
            correctAnswer: 'Patriots',
            type: 'PrePick',
          },
          {
            prepickSequence: 3,
            id: 3,
            title: 'Predict',
            titleColor: Colors.Black,
            labels: [
              { sequence: 1, value: 'the', color: Colors.Black },
              { sequence: 2, value: 'Jaguars Score', color: Colors.Green },
              { sequence: 3, value: '?', color: Colors.Black },
            ],
            choiceType: 'MULTI',
            choices: [
              { id: 1, value: 'Under 21' },
              { id: 2, value: 'Over 21' },
            ],
            background: 'playalong-scoreteama.jpg',
            points: 2000,
            tokens: 50,
            forTeam: { id: 1 },
            shortHand: 'JAGUARS SCORE',
            correctAnswer: 'Under 21',
            type: 'PrePick',
          },
          {
            prepickSequence: 4,
            id: 4,
            title: 'PREDICT',
            titleColor: Colors.Black,
            labels: [
              { sequence: 1, value: 'the', color: Colors.Black },
              { sequence: 2, value: 'Patriots Score', color: Colors.Green },
              { sequence: 3, value: '?', color: Colors.Black },
            ],
            choiceType: 'MULTI',
            choices: [
              { id: 1, value: 'Under 21' },
              { id: 2, value: 'Over 21' },
            ],
            background: 'playalong-qbsack.jpg',
            points: 2000,
            tokens: 50,
            forTeam: { id: 2, teamName: 'Patriots' },
            shortHand: 'PATRIOTS SCORE',
            correctAnswer: 'Over 21',
            type: 'PrePick',
          },
          {
            prepickSequence: 5,
            id: 5,
            title: 'FIRST',
            titleColor: Colors.Black,
            labels: [
              { sequence: 1, value: 'Quarterback', color: Colors.Black },
              { sequence: 2, value: 'Sacked', color: Colors.Green },
            ],
            choiceType: 'AB',
            choices: ['Jaguar', 'Patriots'],
            background: 'playalong-mostsacks.jpg',
            points: 2000,
            tokens: 50,
            forTeam: {},
            shortHand: 'FIRST QB SACKED',
            correctAnswer: 'Patriots',
            type: 'PrePick',
          },
        ],
      },
    })
  },
  pullQuestionsPrePick: () => {
    return new Promise((resolve, reject) => {
      resolve({
        questions: [
          {
            prepickSequence: 1,
            id: 1,
            title: 'Who',
            titleColor: Colors.Black,
            labels: [
              { sequence: 1, value: 'wins the', color: Colors.Black },
              { sequence: 2, value: 'coin toss', color: Colors.Green },
              { sequence: 3, value: '?', color: Colors.Black },
            ],
            choiceType: 'AB',
            choices: ['Jaguars', 'Patriots'],
            background: 'playalong-awaiting.jpg',
            points: 2000,
            tokens: 50,
            forTeam: {},
            shortHand: 'COIN TOSS',
            correctAnswer: 'Jaguars',
            type: 'PrePick',
          },
          {
            prepickSequence: 2,
            id: 2,
            title: 'MOST PASSES',
            titleColor: Colors.Black,
            labels: [
              {
                sequence: 1,
                value: 'What team will complete the most passes?',
                color: Colors.Black,
              },
            ],
            choiceType: 'AB',
            choices: ['Jaguars', 'Patriots'],
            background: 'playalong-penaltyteama.jpg',
            points: 2000,
            tokens: 50,
            shortHand: 'MOST PASSES',
            correctAnswer: 'Patriots',
            type: 'PrePick',
          },
          {
            prepickSequence: 3,
            id: 3,
            title: 'Predict',
            titleColor: Colors.Black,
            labels: [
              { sequence: 1, value: 'the', color: Colors.Black },
              { sequence: 2, value: 'Jaguars Score', color: Colors.Green },
              { sequence: 3, value: '?', color: Colors.Black },
            ],
            choiceType: 'MULTI',
            choices: [
              { id: 1, value: 'Under 21' },
              { id: 2, value: 'Over 21' },
            ],
            background: 'playalong-scoreteama.jpg',
            points: 2000,
            tokens: 50,
            forTeam: { id: 1 },
            shortHand: 'JAGUARS SCORE',
            correctAnswer: 'Under 21',
            type: 'PrePick',
          },
          {
            prepickSequence: 4,
            id: 4,
            title: 'PREDICT',
            titleColor: Colors.Black,
            labels: [
              { sequence: 1, value: 'the', color: Colors.Black },
              { sequence: 2, value: 'Patriots Score', color: Colors.Green },
              { sequence: 3, value: '?', color: Colors.Black },
            ],
            choiceType: 'MULTI',
            choices: [
              { id: 1, value: 'Under 21' },
              { id: 2, value: 'Over 21' },
            ],
            background: 'playalong-qbsack.jpg',
            points: 2000,
            tokens: 50,
            forTeam: { id: 2, teamName: 'Patriots' },
            shortHand: 'PATRIOTS SCORE',
            correctAnswer: 'Over 21',
            type: 'PrePick',
          },
          {
            prepickSequence: 5,
            id: 5,
            title: 'FIRST',
            titleColor: Colors.Black,
            labels: [
              { sequence: 1, value: 'Quarterback', color: Colors.Black },
              { sequence: 2, value: 'Sacked', color: Colors.Green },
            ],
            choiceType: 'AB',
            choices: ['Jaguar', 'Patriots'],
            background: 'playalong-mostsacks.jpg',
            points: 2000,
            tokens: 50,
            forTeam: {},
            shortHand: 'FIRST QB SACKED',
            correctAnswer: 'Patriots',
            type: 'PrePick',
          },
        ],
      })
    })
  },
  pullMessages: () => {
    return new Promise((resolve, reject) => {
      resolve({
        messages: [
          {
            prepickSequence: 1,
            id: 1,
            headers: [
              { sequence: 1, value: 'begin', color: Colors.Black },
              { sequence: 2, value: 'pre-picks', color: Colors.Green },
            ],
            details: [
              { sequence: 1, value: 'PICK and WIN', color: Colors.Black },
              { break: true },
              { sequence: 2, value: '5 PRE-PICKS', color: Colors.Green },
              { break: true },
              { sequence: 3, value: 'Use YOUR', color: Colors.Black },
              { sequence: 4, value: 'points', color: Colors.Blue },
              { sequence: 5, value: '&', color: Colors.Black },
              { sequence: 6, value: 'tokens', color: Colors.Yellow },
              { break: true },
              { sequence: 7, value: 'For', color: Colors.Black },
              { sequence: 8, value: 'LIVE', color: '#c61818' },
              { sequence: 7, value: 'Play', color: Colors.Black },
            ],
          },
          {
            prepickSequence: 2,
            id: 2,
            headers: [],
            details: [
              { sequence: 1, value: 'pick 4', color: Colors.Green },
              { sequence: 2, value: 'and select your', color: Colors.Black },
              { break: true },
              { sequence: 3, value: 'FAVORITE', color: Colors.Black },
              { sequence: 4, value: 'STAR', color: '#eede16' },
              {
                sequence: 5,
                value: 'Prize Category',
                color: Colors.Black,
              },
            ],
          },
          {
            prepickSequence: 3,
            id: 3,
            headers: [],
            details: [
              { sequence: 1, value: 'use', color: Colors.Black },
              { sequence: 2, value: 'points', color: Colors.Blue },
              { sequence: 3, value: '&', color: Colors.Black },
              { sequence: 4, value: 'tokens', color: Colors.Yellow },
              { sequence: 5, value: 'TO PLAY this', color: Colors.Black },
              { break: true },
              { sequence: 6, value: 'game', color: Colors.Black },
              { break: true },
              {
                sequence: 7,
                value: 'apply YOUR WINNINGS to the',
                color: Colors.Black,
              },
              { break: true },
              { sequence: 8, value: 'LIVE', color: '#c61818' },
              { sequence: 9, value: 'EVENTS', color: Colors.Black },
            ],
          },
          {
            prepickSequence: 4,
            id: 4,
            headers: [],
            details: [
              { sequence: 1, value: '2 more PRE-PICKS', color: Colors.Green },
            ],
          },
          {
            prepickSequence: 5,
            id: 5,
            headers: [],
            details: [
              { sequence: 1, value: 'FINAL', color: Colors.Black },
              { sequence: 2, value: 'PRE-PICK', color: Colors.Green },
              { sequence: 3, value: 'apply YOUR', color: Colors.Black },
              { break: true },
              { sequence: 4, value: 'WINNINGS', color: Colors.Black },
              { sequence: 5, value: 'to', color: Colors.Black },
              { sequence: 7, value: 'Play at the', color: Colors.Black },
              { break: true },
              { sequence: 8, value: 'LIVE', color: '#c61818' },
              { sequence: 9, value: 'EVENTS', color: Colors.Black },
            ],
          },
        ],
      })
    })
  },
  pullPreAnswers: () => {
    return new Promise((resolve, reject) => {
      resolve({
        answers: [
          {
            type: 'PrePick',
            multiplier: 0,
            questionId: 1,
            shortHand: 'COIN TOSS',
            answer: 'Jaguars',
          },
          {
            type: 'PrePick',
            multiplier: 0,
            questionId: 2,
            shortHand: 'MOST PASSES',
            answer: 'Patriots',
          },
          {
            type: 'PrePick',
            multiplier: 0,
            questionId: 3,
            shortHand: 'JAGUARS SCORE',
            answer: 'Under 21',
          },
          {
            type: 'PrePick',
            multiplier: 0,
            questionId: 4,
            shortHand: 'PATRIOTS SCORE',
            answer: 'Under 21',
          },
          {
            type: 'PrePick',
            multiplier: 0,
            questionId: 5,
            shortHand: 'FIRST QB SACKED',
            answer: 'Patriots',
          },
        ],
      })
    })
  },
}
