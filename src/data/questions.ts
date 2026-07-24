import type { Question } from '../types'

// ============================================================
// LiverQ (open source) — DEMONSTRATION question bank.
//
// These 16 questions are LIMITED DEMONSTRATION CONTENT written
// independently from general, widely-taught clinical knowledge. They exist
// only so the application can be cloned, run, and demonstrated.
//
//   - Independently written; fictional educational scenarios only.
//   - No PHI. No real patient records.
//   - They do NOT quote or closely paraphrase AASLD or any other guideline.
//   - They cite NO page numbers, tables, figures, or proprietary sections.
//
// The production educational content bank is NOT part of this repository.
// See README.md and CONTENT_LICENSE.md.
// ============================================================

const DEMO_SOURCE = {
  sourceTitle: 'LiverQ demonstration content (independently written; not from any clinical guideline)',
  sourceYear: '',
  sourceSection: 'Demonstration example',
  officialUrl: '',
  status: 'approved' as const,
}

type DemoItem = Pick<
  Question,
  'id' | 'topicId' | 'questionType' | 'question' | 'choices' | 'correctAnswer' | 'explanation'
> &
  Partial<Pick<Question, 'teachingPearl'>>

const DEMO_ITEMS: DemoItem[] = [
  // ---- Liver Basics ----
  {
    id: 'demo-lb-1',
    topicId: 'liver-basics',
    questionType: 'multiple_choice',
    question:
      'In a basic physiology review, which blood vessel delivers the majority of the blood that flows into the liver?',
    choices: ['The portal vein', 'The hepatic artery', 'The hepatic vein', 'The renal vein'],
    correctAnswer: 'The portal vein',
    explanation:
      "Most of the liver's blood arrives through the portal vein, which carries nutrient-rich blood from the intestines. The hepatic artery supplies the remainder as oxygen-rich blood, and the hepatic vein drains blood out of the liver.",
    teachingPearl: 'The liver has a dual blood supply: mostly portal vein, partly hepatic artery.',
  },
  {
    id: 'demo-lb-2',
    topicId: 'liver-basics',
    questionType: 'multiple_choice',
    question: 'Which protein that helps keep fluid inside blood vessels is made mainly by the liver?',
    choices: ['Albumin', 'Insulin', 'Amylase', 'Hemoglobin'],
    correctAnswer: 'Albumin',
    explanation:
      'Albumin is produced by liver cells and helps maintain the oncotic pressure that keeps fluid within blood vessels. A low albumin level can be one sign of reduced liver synthetic function.',
  },
  {
    id: 'demo-lb-3',
    topicId: 'liver-basics',
    questionType: 'multiple_choice',
    question: 'The liver helps clear ammonia from the body by converting it into which substance for excretion?',
    choices: ['Urea', 'Glucose', 'Creatinine', 'Lactate'],
    correctAnswer: 'Urea',
    explanation:
      'Through the urea cycle, the liver converts ammonia into urea, which the kidneys then excrete in urine. Reduced liver function can allow ammonia to build up.',
  },
  {
    id: 'demo-lb-4',
    topicId: 'liver-basics',
    questionType: 'true_false',
    question: 'True or False: In general, the liver has essentially no ability to regenerate after injury.',
    choices: ['True', 'False'],
    correctAnswer: 'False',
    explanation:
      'The liver is notable for its regenerative capacity. After part of it is removed or injured, remaining healthy liver cells can multiply to help restore liver mass.',
  },

  // ---- Viral Hepatitis Basics ----
  {
    id: 'demo-vh-1',
    topicId: 'viral-hepatitis-basics',
    questionType: 'multiple_choice',
    question:
      'In a general teaching overview, which hepatitis virus is most typically spread through contaminated food or water?',
    choices: ['Hepatitis A', 'Hepatitis B', 'Hepatitis C', 'Hepatitis D'],
    correctAnswer: 'Hepatitis A',
    explanation:
      'Hepatitis A commonly spreads by the fecal-oral route, such as through contaminated food or water. It usually causes a self-limited illness and does not become a long-term (chronic) infection.',
  },
  {
    id: 'demo-vh-2',
    topicId: 'viral-hepatitis-basics',
    questionType: 'multiple_choice',
    question: 'Which hepatitis virus has a widely available preventive vaccine?',
    choices: ['Hepatitis B', 'Hepatitis C', 'Hepatitis E', 'Hepatitis G'],
    correctAnswer: 'Hepatitis B',
    explanation:
      'A widely available vaccine can prevent hepatitis B. There is currently no preventive vaccine for hepatitis C. This item is limited demonstration content and is not based on wording from any clinical guideline.',
  },
  {
    id: 'demo-vh-3',
    topicId: 'viral-hepatitis-basics',
    questionType: 'multiple_choice',
    question: 'Hepatitis C is mainly spread by which route in a basic overview?',
    choices: ['Blood-to-blood contact', 'Airborne coughing', 'Casual handshakes', 'Mosquito bites'],
    correctAnswer: 'Blood-to-blood contact',
    explanation:
      'Hepatitis C is a bloodborne virus, spread mainly through blood-to-blood contact (for example, sharing needles). It is not spread by casual contact such as shaking hands.',
  },
  {
    id: 'demo-vh-4',
    topicId: 'viral-hepatitis-basics',
    questionType: 'true_false',
    question:
      'True or False: Hepatitis B is more likely to become a long-term (chronic) infection when it is acquired very early in life.',
    choices: ['True', 'False'],
    correctAnswer: 'True',
    explanation:
      'Hepatitis B acquired around birth or in early childhood is more likely to become chronic, whereas most healthy adults who acquire it clear the infection. This is a general teaching point.',
  },

  // ---- Cirrhosis and Complications ----
  {
    id: 'demo-cc-1',
    topicId: 'cirrhosis-and-complications',
    questionType: 'multiple_choice',
    question:
      'In a fictional teaching scenario, a person with long-standing cirrhosis notices gradual abdominal swelling from fluid buildup. What is this fluid collection in the abdomen called?',
    choices: ['Ascites', 'Pleural effusion', 'Hematuria', 'Melena'],
    correctAnswer: 'Ascites',
    explanation:
      'Fluid collecting in the abdominal (peritoneal) cavity is called ascites. It is a common complication of advanced cirrhosis, related to increased pressure in the portal circulation and low albumin.',
  },
  {
    id: 'demo-cc-2',
    topicId: 'cirrhosis-and-complications',
    questionType: 'multiple_choice',
    question: 'Scarring from cirrhosis raises pressure in which circulation, which can lead to enlarged veins (varices)?',
    choices: [
      'The portal (liver) circulation',
      'The pulmonary circulation',
      'The coronary arteries',
      'The renal arteries',
    ],
    correctAnswer: 'The portal (liver) circulation',
    explanation:
      'Cirrhosis increases resistance to blood flow through the liver, raising pressure in the portal circulation (portal hypertension). This can cause collateral veins such as varices to form.',
  },
  {
    id: 'demo-cc-3',
    topicId: 'cirrhosis-and-complications',
    questionType: 'multiple_choice',
    question:
      'Confusion and altered thinking in advanced liver disease, related to a buildup of substances the liver would normally clear, is generally called what?',
    choices: ['Hepatic encephalopathy', 'Bacterial meningitis', 'Migraine', 'Motion sickness'],
    correctAnswer: 'Hepatic encephalopathy',
    explanation:
      'Hepatic encephalopathy refers to changes in thinking and alertness that can occur when a poorly functioning liver cannot adequately clear gut-derived substances such as ammonia. This is a general educational description.',
  },
  {
    id: 'demo-cc-4',
    topicId: 'cirrhosis-and-complications',
    questionType: 'multiple_choice',
    question:
      'In a general teaching example, which lifestyle step is most appropriate to recommend for someone with alcohol-related cirrhosis?',
    choices: [
      'Avoiding alcohol',
      'Gradually increasing alcohol',
      'Starting to smoke',
      'Permanently avoiding all dietary protein',
    ],
    correctAnswer: 'Avoiding alcohol',
    explanation:
      'Avoiding alcohol helps prevent further liver injury. People with cirrhosis are generally not told to eliminate all protein, since adequate nutrition matters. This is a broad educational point, not individual medical advice.',
  },

  // ---- Liver Tests and Imaging ----
  {
    id: 'demo-lt-1',
    topicId: 'liver-tests-and-imaging',
    questionType: 'multiple_choice',
    question: 'Raised ALT and AST levels on a blood test most directly point to which general problem?',
    choices: ['Injury to liver cells', 'A broken bone', 'Iron-deficiency anemia', 'A thyroid problem'],
    correctAnswer: 'Injury to liver cells',
    explanation:
      'ALT and AST are enzymes found in liver cells. When those cells are injured, the enzymes leak into the blood, so higher levels generally suggest hepatocellular (liver cell) injury.',
  },
  {
    id: 'demo-lt-2',
    topicId: 'liver-tests-and-imaging',
    questionType: 'multiple_choice',
    question: "Which blood test reflects the liver's ability to make clotting factors?",
    choices: ['Prothrombin time / INR', 'Serum sodium', 'White blood cell count', 'Fasting glucose'],
    correctAnswer: 'Prothrombin time / INR',
    explanation:
      'The liver makes several clotting factors. When liver synthetic function drops, the prothrombin time (reported as INR) can lengthen, so it is used as one general marker of that function.',
  },
  {
    id: 'demo-lt-3',
    topicId: 'liver-tests-and-imaging',
    questionType: 'multiple_choice',
    question:
      'Which imaging test is commonly used first to look at the liver because it is non-invasive and uses no ionizing radiation?',
    choices: ['Ultrasound', 'A radiation-based bone scan', 'A whole-body PET scan', 'A plain chest X-ray'],
    correctAnswer: 'Ultrasound',
    explanation:
      'Ultrasound is a widely used, non-invasive, radiation-free way to get a first look at the liver. Tests such as CT or MRI may be added depending on the situation.',
  },
  {
    id: 'demo-lt-4',
    topicId: 'liver-tests-and-imaging',
    questionType: 'multiple_choice',
    question: 'A rising bilirubin level can produce which visible sign?',
    choices: [
      'Yellowing of the skin and eyes (jaundice)',
      'Blue fingernails',
      'Sudden hair loss',
      'Ringing in the ears',
    ],
    correctAnswer: 'Yellowing of the skin and eyes (jaundice)',
    explanation:
      'When bilirubin builds up, it can deposit in the skin and the whites of the eyes, producing the yellow color called jaundice.',
  },
]

export const QUESTIONS: Question[] = DEMO_ITEMS.map((item) => ({ ...item, ...DEMO_SOURCE }))
