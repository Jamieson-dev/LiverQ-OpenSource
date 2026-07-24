import type { Abbreviation } from '../types'

// ============================================================
// LiverQ (open source) — abbreviation glossary (DEMONSTRATION set).
//
// A small set of 20 standard, widely-used hepatology abbreviations, listed
// independently as common medical terminology to demonstrate the glossary
// feature. The UI shows only `abbreviation` and `fullName`.
// ============================================================

export const ABBREVIATIONS: Abbreviation[] = [
  { abbreviation: 'ALT', fullName: 'Alanine aminotransferase' },
  { abbreviation: 'AST', fullName: 'Aspartate aminotransferase' },
  { abbreviation: 'ALP', fullName: 'Alkaline phosphatase' },
  { abbreviation: 'GGT', fullName: 'Gamma-glutamyl transferase' },
  { abbreviation: 'INR', fullName: 'International normalized ratio' },
  { abbreviation: 'PT', fullName: 'Prothrombin time' },
  { abbreviation: 'LFT', fullName: 'Liver function test' },
  { abbreviation: 'HAV', fullName: 'Hepatitis A virus' },
  { abbreviation: 'HBV', fullName: 'Hepatitis B virus' },
  { abbreviation: 'HCV', fullName: 'Hepatitis C virus' },
  { abbreviation: 'NAFLD', fullName: 'Non-alcoholic fatty liver disease' },
  { abbreviation: 'HCC', fullName: 'Hepatocellular carcinoma' },
  { abbreviation: 'HE', fullName: 'Hepatic encephalopathy' },
  { abbreviation: 'SBP', fullName: 'Spontaneous bacterial peritonitis' },
  { abbreviation: 'TIPS', fullName: 'Transjugular intrahepatic portosystemic shunt' },
  { abbreviation: 'MELD', fullName: 'Model for End-Stage Liver Disease' },
  { abbreviation: 'US', fullName: 'Ultrasound' },
  { abbreviation: 'CT', fullName: 'Computed tomography' },
  { abbreviation: 'MRI', fullName: 'Magnetic resonance imaging' },
  { abbreviation: 'LT', fullName: 'Liver transplantation' },
]
