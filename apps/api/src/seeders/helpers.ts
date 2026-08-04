import { INDORE_LOCALITIES } from './seed.config';

export const INDIAN_MALE_FIRST_NAMES = [
  'Akshay', 'Rajesh', 'Priya', 'Rahul', 'Arjun', 'Suresh', 'Vikram', 'Deepak',
  'Rohit', 'Pratap', 'Ajay', 'Amit', 'Sunil', 'Vijay', 'Alok', 'Manoj', 'Anil',
  'Sanjay', 'Manish', 'Gaurav', 'Siddharth', 'Nikhil', 'Aditya', 'Rohan', 'Vishal',
  'Sandeep', 'Praveen', 'Karan', 'Abhishek', 'Mayank', 'Harsh', 'Yash', 'Devendra',
  'Ashok', 'Dinesh', 'Nilesh', 'Mahesh', 'Ganesh', 'Ramesh', 'Satish'
];

export const INDIAN_FEMALE_FIRST_NAMES = [
  'Priya', 'Sneha', 'Meera', 'Anita', 'Sunita', 'Sangeeta', 'Kavita', 'Nalini',
  'Pooja', 'Neha', 'Ritu', 'Swati', 'Anjali', 'Divya', 'Shweta', 'Monika', 'Preeti',
  'Aarti', 'Rekha', 'Seema', 'Vandana', 'Rachna', 'Geeta', 'Shalini', 'Nisha',
  'Deepa', 'Rashmi', 'Kiran', 'Sujata', 'Archana', 'Bhavna', 'Trupti', 'Payal',
  'Shruti', 'Anushka', 'Riddhi', 'Kavya', 'Poonam', 'Sunanda', 'Radha'
];

export const INDIAN_LAST_NAMES = [
  'Ladne', 'Sharma', 'Verma', 'Patil', 'Singh', 'Joshi', 'Kulkarni', 'Nambiar',
  'Desai', 'Bhosale', 'Rao', 'Srivastava', 'Menon', 'Mehta', 'Agarwal', 'Shinde',
  'Iyer', 'Khedkar', 'Tiwari', 'Bhatt', 'Sawant', 'Gupta', 'Chouhan', 'Solanki',
  'Jain', 'Mishra', 'Pandey', 'Dubey', 'Yadav', 'Malviya', 'Thakur', 'Tripathi',
  'Choudhary', 'Rathore', 'Pathak', 'Saxena', 'Dube', 'Upadhyay', 'Sharma', 'Mukherjee'
];

export const QUALIFICATIONS_LIST = [
  ['MBBS', 'MD (General Medicine)'],
  ['MBBS', 'DM (Cardiology)'],
  ['MBBS', 'MS (Orthopaedics)'],
  ['MBBS', 'MD (Paediatrics)'],
  ['MBBS', 'MS (Obstetrics & Gynaecology)'],
  ['MBBS', 'MD (Dermatology)'],
  ['MBBS', 'MS (ENT)'],
  ['MBBS', 'MD (Psychiatry)'],
  ['MBBS', 'DM (Neurology)'],
  ['MBBS', 'DM (Nephrology)'],
  ['MBBS', 'DNB (Emergency Medicine)'],
  ['MBBS', 'MD (Radiology)'],
  ['BDS', 'MDS'],
  ['BPT', 'MPT (Physiotherapy)'],
  ['B.Sc Nursing', 'M.Sc Nursing'],
];

export function getRandomElement<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

export function getRandomElements<T>(arr: T[], count: number): T[] {
  const shuffled = [...arr].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
}

export function getRandomNumber(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function generateIndianPhone(): string {
  const prefixes = ['9826', '9425', '9893', '9179', '9827', '9755', '9981', '7000', '8818', '9926'];
  const prefix = getRandomElement(prefixes);
  const suffix = Math.floor(100000 + Math.random() * 900000);
  return `+91 ${prefix}${suffix}`;
}

export function generateIndoreAddress(): {
  line1: string;
  city: string;
  state: string;
  country: string;
  postalCode: string;
} {
  const locality = getRandomElement(INDORE_LOCALITIES);
  const houseNum = getRandomNumber(1, 150);
  const block = getRandomElement(['Block A', 'Block B', 'Sector 1', 'Scheme 54', 'Scheme 78', 'Plot ' + houseNum]);
  
  return {
    line1: `${block}, ${locality}`,
    city: 'Indore',
    state: 'Madhya Pradesh',
    country: 'India',
    postalCode: getRandomElement(['452001', '452010', '452011', '452012', '452016', '452018']),
  };
}

export function getRandomDateInPast(days: number): Date {
  const date = new Date();
  date.setDate(date.getDate() - getRandomNumber(1, days));
  return date;
}

export function getRandomDateInFuture(days: number): Date {
  const date = new Date();
  date.setDate(date.getDate() + getRandomNumber(1, days));
  return date;
}
