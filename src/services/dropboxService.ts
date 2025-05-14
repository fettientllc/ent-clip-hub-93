export const uploadFileToDropbox = async (file: File, path: string) => {
  const DROPBOX_ACCESS_TOKEN = import.meta.env.VITE_DROPBOX_ACCESS_TOKEN;

  const response = await fetch("https://content.dropboxapi.com/2/files/upload", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${DROPBOX_ACCESS_TOKEN}`,
      "Dropbox-API-Arg": JSON.stringify({ path, mode: "add", autorename: true }),
      "Content-Type": "application/octet-stream",
    },
    body: file,
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Dropbox error: ${text}`);
  }

  return await response.json();
};
