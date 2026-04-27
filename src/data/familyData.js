const SEED_DATE     = '2026-04-22T08:00:00.000Z'
const SEED_DONE_AT  = '2026-04-22T10:00:00.000Z'

// Period keys for seed data (all tasks seeded on 2026-04-22, ISO week 17)
const D_KEY = '2026-04-22'
const W_KEY = '2026-W17'
const M_KEY = '2026-04'

function template(id, title, description) {
  return { id, title, description }
}

function task(id, title, description, status, comments, periodType, periodKey) {
  return {
    id,
    title,
    description,
    status,
    comments,
    periodType,
    periodKey,
    createdAt:   SEED_DATE,
    updatedAt:   status === 'done' ? SEED_DONE_AT : SEED_DATE,
    completedAt: status === 'done' ? SEED_DONE_AT : null,
  }
}

const familyData = [
  {
    id: 'father',
    name: 'Father',
    trackingStartDate: '2026-04-01',
    templates: {
      daily: [
        template('f-dt-1', 'Check emails',   'Go through morning work emails.'),
        template('f-dt-2', 'Prepare lunch',  'Cook lunch for the family.'),
        template('f-dt-3', 'Morning run',    '30 minute jog around the park.'),
      ],
      weekly: [
        template('f-wt-1', 'Grocery shopping', 'Buy groceries for the week.'),
        template('f-wt-2', 'Mow the lawn',     'Mow front and back garden.'),
        template('f-wt-3', 'Car wash',         'Wash and vacuum the car.'),
      ],
      monthly: [
        template('f-mt-1', 'Pay bills',        'Pay electricity and internet bills.'),
        template('f-mt-2', 'Budget review',    'Review monthly household budget.'),
      ],
    },
    boards: {
      daily: [
        task('f-d-1', 'Check emails',      'Go through morning work emails.',     'todo',       ['Reply to the team first.', 'Check the inbox from yesterday too.'], 'daily', D_KEY),
        task('f-d-2', 'Prepare lunch',     'Cook lunch for the family.',           'todo',       [], 'daily', D_KEY),
        task('f-d-3', 'Morning run',       '30 minute jog around the park.',       'inprogress', ['Good pace today!'], 'daily', D_KEY),
        task('f-d-4', 'Make coffee',       'Brew coffee for everyone.',            'done',       [], 'daily', D_KEY),
      ],
      weekly: [
        task('f-w-1', 'Grocery shopping',  'Buy groceries for the week.',          'todo',       [], 'weekly', W_KEY),
        task('f-w-2', 'Mow the lawn',      'Mow front and back garden.',           'inprogress', [], 'weekly', W_KEY),
        task('f-w-3', 'Car wash',          'Wash and vacuum the car.',             'done',       [], 'weekly', W_KEY),
      ],
      monthly: [
        task('f-m-1', 'Pay bills',         'Pay electricity and internet bills.',  'todo',       [], 'monthly', M_KEY),
        task('f-m-2', 'Budget review',     'Review monthly household budget.',     'inprogress', [], 'monthly', M_KEY),
        task('f-m-3', 'Insurance renewal', 'Renew home insurance policy.',         'done',       [], 'monthly', M_KEY),
      ],
    },
  },
  {
    id: 'mother',
    name: 'Mother',
    trackingStartDate: '2026-04-01',
    templates: {
      daily: [
        template('m-dt-1', 'School pickup',  'Pick up kids from school at 3pm.'),
        template('m-dt-2', 'Cook dinner',    'Prepare dinner for the family.'),
        template('m-dt-3', 'Morning yoga',   '20 minute yoga session.'),
      ],
      weekly: [
        template('m-wt-1', 'Meal planning',  'Plan meals for the upcoming week.'),
        template('m-wt-2', 'House cleaning', 'Deep clean the living room.'),
        template('m-wt-3', 'Pharmacy run',   'Pick up prescriptions.'),
      ],
      monthly: [
        template('m-mt-1', 'Book dentist',   'Schedule dentist for the kids.'),
        template('m-mt-2', 'School forms',   'Fill in and return school forms.'),
      ],
    },
    boards: {
      daily: [
        task('m-d-1', 'School pickup',     'Pick up kids from school at 3pm.',     'todo',       [], 'daily', D_KEY),
        task('m-d-2', 'Cook dinner',       'Prepare dinner for the family.',       'todo',       ['Making pasta tonight.'], 'daily', D_KEY),
        task('m-d-3', 'Laundry',           'Wash and dry a load of laundry.',      'inprogress', [], 'daily', D_KEY),
        task('m-d-4', 'Morning yoga',      '20 minute yoga session.',              'done',       [], 'daily', D_KEY),
      ],
      weekly: [
        task('m-w-1', 'Meal planning',     'Plan meals for the upcoming week.',    'todo',       [], 'weekly', W_KEY),
        task('m-w-2', 'House cleaning',    'Deep clean the living room.',          'inprogress', [], 'weekly', W_KEY),
        task('m-w-3', 'Pharmacy run',      'Pick up prescriptions.',               'done',       [], 'weekly', W_KEY),
      ],
      monthly: [
        task('m-m-1', 'Book dentist',      'Schedule dentist for the kids.',       'todo',       [], 'monthly', M_KEY),
        task('m-m-2', 'Wardrobe sort',     'Sort and donate old clothes.',         'inprogress', [], 'monthly', M_KEY),
        task('m-m-3', 'School forms',      'Fill in and return school forms.',     'done',       [], 'monthly', M_KEY),
      ],
    },
  },
  {
    id: 'daughter-1',
    name: 'Daughter 1',
    trackingStartDate: '2026-04-01',
    templates: {
      daily: [
        template('d1-dt-1', 'Homework',        'Finish maths and reading homework.'),
        template('d1-dt-2', 'Tidy bedroom',    'Put away toys and make the bed.'),
        template('d1-dt-3', 'Piano practice',  'Practice piano for 20 minutes.'),
      ],
      weekly: [
        template('d1-wt-1', 'Library book',   'Return library book and pick a new one.'),
        template('d1-wt-2', 'Art project',    'Work on school art project.'),
        template('d1-wt-3', 'Sports training','Attend Saturday football practice.'),
      ],
      monthly: [
        template('d1-mt-1', 'Book report',    'Write a one-page book report.'),
        template('d1-mt-2', 'Science fair',   'Prepare science fair experiment.'),
      ],
    },
    boards: {
      daily: [
        task('d1-d-1', 'Homework',         'Finish maths and reading homework.',   'todo',       [], 'daily', D_KEY),
        task('d1-d-2', 'Tidy bedroom',     'Put away toys and make the bed.',      'todo',       [], 'daily', D_KEY),
        task('d1-d-3', 'Piano practice',   'Practice piano for 20 minutes.',       'inprogress', ['Work on the left hand part.'], 'daily', D_KEY),
        task('d1-d-4', 'Brush teeth',      'Morning and evening teeth brushing.',  'done',       [], 'daily', D_KEY),
      ],
      weekly: [
        task('d1-w-1', 'Library book',     'Return library book and pick a new one.', 'todo',   [], 'weekly', W_KEY),
        task('d1-w-2', 'Art project',      'Work on school art project.',          'inprogress', [], 'weekly', W_KEY),
        task('d1-w-3', 'Sports training',  'Attend Saturday football practice.',   'done',       [], 'weekly', W_KEY),
      ],
      monthly: [
        task('d1-m-1', 'Book report',      'Write a one-page book report.',        'todo',       [], 'monthly', M_KEY),
        task('d1-m-2', 'Science fair',     'Prepare science fair experiment.',     'inprogress', [], 'monthly', M_KEY),
        task('d1-m-3', 'Pen pal letter',   'Write and send letter to pen pal.',    'done',       [], 'monthly', M_KEY),
      ],
    },
  },
  {
    id: 'daughter-2',
    name: 'Daughter 2',
    trackingStartDate: '2026-04-01',
    templates: {
      daily: [
        template('d2-dt-1', 'Reading time',  'Read for 15 minutes before bed.'),
        template('d2-dt-2', 'Feed the cat',  'Give the cat morning and evening food.'),
        template('d2-dt-3', 'Drawing',       'Finish colouring book page.'),
      ],
      weekly: [
        template('d2-wt-1', 'Tidy toys',    'Organise toy box and shelves.'),
        template('d2-wt-2', 'Baking help',  'Help mum bake biscuits on Sunday.'),
        template('d2-wt-3', 'Swimming class','Attend weekly swimming lesson.'),
      ],
      monthly: [
        template('d2-mt-1', 'Puzzle',       'Complete the 100-piece jigsaw puzzle.'),
        template('d2-mt-2', 'Scrapbook',    'Add new photos to the family scrapbook.'),
      ],
    },
    boards: {
      daily: [
        task('d2-d-1', 'Reading time',     'Read for 15 minutes before bed.',      'todo',       [], 'daily', D_KEY),
        task('d2-d-2', 'Feed the cat',     'Give the cat morning and evening food.', 'todo',     [], 'daily', D_KEY),
        task('d2-d-3', 'Drawing',          'Finish colouring book page.',          'inprogress', [], 'daily', D_KEY),
        task('d2-d-4', 'Get dressed',      'Get ready for school independently.',  'done',       [], 'daily', D_KEY),
      ],
      weekly: [
        task('d2-w-1', 'Tidy toys',        'Organise toy box and shelves.',        'todo',       [], 'weekly', W_KEY),
        task('d2-w-2', 'Baking help',      'Help mum bake biscuits on Sunday.',    'inprogress', [], 'weekly', W_KEY),
        task('d2-w-3', 'Swimming class',   'Attend weekly swimming lesson.',       'done',       [], 'weekly', W_KEY),
      ],
      monthly: [
        task('d2-m-1', 'Puzzle',           'Complete the 100-piece jigsaw puzzle.', 'todo',     [], 'monthly', M_KEY),
        task('d2-m-2', 'Scrapbook',        'Add new photos to the family scrapbook.', 'inprogress', [], 'monthly', M_KEY),
        task('d2-m-3', 'Birthday card',    "Make a card for grandma's birthday.",  'done',       [], 'monthly', M_KEY),
      ],
    },
  },
  {
    id: 'son',
    name: 'Son',
    trackingStartDate: '2026-04-01',
    templates: {
      daily: [
        template('s-dt-1', 'Homework',       'Complete history and science homework.'),
        template('s-dt-2', 'Take out bins',  'Take bins to the kerb for collection.'),
        template('s-dt-3', 'Guitar practice','Practice guitar for 30 minutes.'),
      ],
      weekly: [
        template('s-wt-1', 'Clean bike',    'Wipe down and oil the bicycle chain.'),
        template('s-wt-2', 'Coding project','Build a simple game in Scratch.'),
        template('s-wt-3', 'Football match','Play in the Sunday league match.'),
      ],
      monthly: [
        template('s-mt-1', 'Room deep clean',    'Vacuum, dust, and reorganise bedroom.'),
        template('s-mt-2', 'Reading challenge',  'Read two books for school challenge.'),
      ],
    },
    boards: {
      daily: [
        task('s-d-1', 'Homework',          'Complete history and science homework.', 'todo',     [], 'daily', D_KEY),
        task('s-d-2', 'Take out bins',     'Take bins to the kerb for collection.', 'todo',     [], 'daily', D_KEY),
        task('s-d-3', 'Guitar practice',   'Practice guitar for 30 minutes.',       'inprogress', ['Focus on the chorus riff.'], 'daily', D_KEY),
        task('s-d-4', 'Make bed',          'Make bed before leaving for school.',   'done',       [], 'daily', D_KEY),
      ],
      weekly: [
        task('s-w-1', 'Clean bike',        'Wipe down and oil the bicycle chain.',  'todo',       [], 'weekly', W_KEY),
        task('s-w-2', 'Coding project',    'Build a simple game in Scratch.',       'inprogress', [], 'weekly', W_KEY),
        task('s-w-3', 'Football match',    'Play in the Sunday league match.',      'done',       [], 'weekly', W_KEY),
      ],
      monthly: [
        task('s-m-1', 'Room deep clean',   'Vacuum, dust, and reorganise bedroom.', 'todo',       [], 'monthly', M_KEY),
        task('s-m-2', 'Reading challenge', 'Read two books for school challenge.',  'inprogress', [], 'monthly', M_KEY),
        task('s-m-3', 'Charity run',       'Complete 5km fun run for school.',      'done',       [], 'monthly', M_KEY),
      ],
    },
  },
]

export default familyData
