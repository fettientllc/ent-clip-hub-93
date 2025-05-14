import { uploadToCloudinary } from "@/services/cloudinaryService";
import { uploadFileToDropbox } from "@/services/dropboxService";
import { submitFormToSupabase } from "@/services/submissionWorkflowService"; // Create this if missing
import { SubmissionData } from "@/types/submission";
import { v4 as uuidv4 } from "uuid";

const useSubmitForm = () => {
  const handleSubmit = async (formData: any, videoFile: File) => {
    try {
      // 1. Upload to Cloudinary
      const cloudinaryRes = await uploadToCloudinary(videoFile);
      const cloudinaryUrl = cloudinaryRes.secure_url;
      const cloudinaryPublicId = cloudinaryRes.public_id;

      // 2. Upload file to Dropbox
      const dropboxPath = `/submissions/${uuidv4()}-${videoFile.name}`;
      const dropboxRes = await uploadFileToDropbox(videoFile, dropboxPath);

      // 3. Submit to Supabase
      const submission: SubmissionData = {
        ...formData,
        videoUrl: cloudinaryUrl,
        cloudinaryPublicId,
        dropboxFilePath: dropboxRes.path_display,
        status: "pending",
        submittedAt: new Date().toISOString(),
      };

      await submitFormToSupabase(submission);
      return { success: true };
    } catch (err) {
      console.error("Form submission error:", err);
      return { success: false, error: err.message };
    }
  };

  return { handleSubmit };
};

export default useSubmitForm;
