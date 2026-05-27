import { parse } from "date-fns";
// convert string to date
// currently useful for converting data from habit database to native JS date object
// format: yyyy-mm-dd
export function stringToDate(dateString: string): Date | null {
  // using date-fns
  const formatString = 'yyyy-MM-dd';
  const dateRef = new Date();
  if (!dateString) return null;
  let finalDate = parse(dateString, formatString, dateRef)
  return finalDate;
}
