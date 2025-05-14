
import { useToast } from "@/hooks/use-toast";

interface MailingListEntry {
  firstName: string;
  lastName: string;
  email: string;
  source: "user_info" | "submission";
  keepInTouch?: boolean;
  addedAt: string;
}

// In-memory storage for demo purposes
// In a real application, this would be replaced with a database call
const mailingList: MailingListEntry[] = [];

export const useMailingListService = () => {
  const { toast } = useToast();
  
  const addToMailingList = async (
    firstName: string,
    lastName: string,
    email: string,
    source: "user_info" | "submission",
    keepInTouch: boolean = true
  ): Promise<boolean> => {
    // Check if email already exists in the list
    const emailExists = mailingList.some(entry => entry.email.toLowerCase() === email.toLowerCase());
    
    if (emailExists) {
      console.log(`Email ${email} already exists in mailing list`);
      return false;
    }
    
    try {
      // Add to mailing list
      const newEntry: MailingListEntry = {
        firstName,
        lastName,
        email,
        source,
        keepInTouch,
        addedAt: new Date().toISOString()
      };
      
      mailingList.push(newEntry);
      
      // For debugging - log the current mailing list
      console.log("Current mailing list:", mailingList);
      
      return true;
    } catch (error) {
      console.error("Error adding to mailing list:", error);
      return false;
    }
  };
  
  const getMailingList = (): MailingListEntry[] => {
    return [...mailingList]; // Return a copy to prevent direct mutation
  };
  
  return {
    addToMailingList,
    getMailingList
  };
};
