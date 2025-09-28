import React, { useState, useCallback, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Upload,
  FileText,
  Image,
  Video,
  Music,
  X,
  Download,
  Eye,
} from "lucide-react";
import { Button } from "../components/ui/button";
import { Card } from "../components/ui/card";
import { Progress } from "../components/ui/progress";
import { Input } from "../components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../components/ui/dialog";
import { useNavigate } from "react-router-dom";

interface FileUpload {
  id: string;
  name: string;
  size: number;
  type: string;
  uploadedAt: Date;
  progress: number;
  url?: string;
  subject: string;
  // runtime-only (not persisted)
  raw?: File | null;
  serverResponse?: {
    pdf_id: string;
    filename: string;
    message: string;
    status: string;
  };
  serverError?: string;
  generating?: boolean;
}

const UploadPage: React.FC = () => {
  const navigate = useNavigate();
  const [files, setFiles] = useState<FileUpload[]>([]);

  const fetchUserFiles = async () => {
    try {
      const token = localStorage.getItem("access_token"); // Get the user token from storage
      if (!token) {
        console.error("No user token found");
        return;
      }

      const response = await fetch("http://localhost:8000/pdf/user/all", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch user files");
      }

      const data = await response.json();
      // Transform the API response to match our FileUpload interface
      const transformedFiles = data.pdfs.map((pdf: any) => ({
        id: pdf.id,
        name: pdf.original_filename,
        size: pdf.file_size,
        type: "application/pdf",
        uploadedAt: new Date(pdf.created_at || pdf.updated_at),
        progress: 100, // Since these are already uploaded files
        url: pdf.storage_path,
        subject: "PDF Document",
        serverResponse: {
          pdf_id: pdf.id,
          filename: pdf.filename,
          message: "File uploaded successfully",
          status: pdf.status,
        },
      }));

      setFiles(transformedFiles);
    } catch (error) {
      console.error("Error fetching user files:", error);
    }
  };

  useEffect(() => {
    fetchUserFiles();
  }, []);
  const [isDragOver, setIsDragOver] = useState(false);
  const [subject, setSubject] = useState("");
  const [subjectError, setSubjectError] = useState("");
  const [showQuizDialog, setShowQuizDialog] = useState(false);
  const [selectedFile, setSelectedFile] = useState<FileUpload | null>(null);
  const [numQuestions, setNumQuestions] = useState(5);
  const [minDifficulty, setMinDifficulty] = useState(1);
  const [maxDifficulty, setMaxDifficulty] = useState(3);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const getFileIcon = (type: string) => {
    if (type.startsWith("image/"))
      return <Image className="h-8 w-8 text-green-500" />;
    if (type.startsWith("video/"))
      return <Video className="h-8 w-8 text-red-500" />;
    if (type.startsWith("audio/"))
      return <Music className="h-8 w-8 text-purple-500" />;
    return <FileText className="h-8 w-8 text-blue-500" />;
  };

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);

    const droppedFiles = Array.from(e.dataTransfer.files);
    handleFileUpload(droppedFiles);
  }, []);

  const handleFileUpload = (fileList: File[]) => {
    setSubjectError("");
    fileList.forEach((file) => {
      const fileId = Date.now().toString() + Math.random().toString(36);
      const newFile: FileUpload = {
        id: fileId,
        name: file.name,
        size: file.size,
        type: file.type,
        uploadedAt: new Date(),
        progress: 0,
        // Optionally, you can add subject to FileUpload type if you want to display it per file
        subject: subject.trim(),
        raw: file,
      };

      setFiles((prev) => [...prev, newFile]);

      // Simulate upload progress
      let progress = 0;
      const interval = setInterval(() => {
        progress += Math.random() * 15;
        if (progress >= 100) {
          progress = 100;
          clearInterval(interval);
          const completed = { ...newFile, progress: 100, url: "#" };
          setFiles((prev) =>
            prev.map((f) => (f.id === fileId ? completed : f))
          );

          // If PDF, send as multipart/form-data (field 'file') along with subject
          if (newFile.type === "application/pdf" && newFile.raw) {
            (async () => {
              const rawFile = newFile.raw as File;
              try {
                const form = new FormData();
                form.append("file", rawFile, rawFile.name);
                // form.append('subject', subject.trim());

                const res = await fetch("http://localhost:8000/pdf/upload", {
                  method: "POST",
                  headers: {
                    Authorization: `Bearer ${localStorage.getItem(
                      "access_token"
                    )}`,
                  },
                  body: form,
                });
                if (!res.ok)
                  throw new Error(
                    `Upload failed: ${res.status} ${res.statusText}`
                  );
                const ct = res.headers.get("content-type") || "";
                let data: any = null;
                if (ct.includes("application/json")) data = await res.json();
                else data = await res.text();
                const updatedFile: FileUpload = {
                  id: fileId,
                  name: file.name,
                  size: file.size,
                  type: file.type,
                  uploadedAt: new Date(),
                  progress: 100,
                  url: typeof data === "string" ? data : data?.url ?? "#",
                  subject: subject.trim(),
                  serverResponse: data,
                };
                setFiles((prev) =>
                  prev.map((f) => (f.id === fileId ? updatedFile : f))
                );

                // Refetch the list of files from the server after successful upload
                await fetchUserFiles();
              } catch (err: any) {
                setFiles((prev) =>
                  prev.map((f) =>
                    f.id === fileId
                      ? { ...f, serverError: err?.message ?? String(err) }
                      : f
                  )
                );
              }
            })();
          }
        }
        setFiles((prev) =>
          prev.map((f) => (f.id === fileId ? { ...f, progress } : f))
        );
      }, 200);
    });
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      handleFileUpload(Array.from(e.target.files));
    }
  };

  const handleChooseFilesClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const removeFile = (fileId: string) => {
    const remaining = files.filter((f) => f.id !== fileId);
    setFiles(remaining);
    // Note: If you need to delete files from server, add API call here
  };

  // Placeholder for quiz generation logic
  // const handleGenerateQuiz = (file: FileUpload) => {
  //   alert(`Quiz generation for '${file.name}' coming soon!`);
  // };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring" as const,
        stiffness: 300,
        damping: 24,
      },
    },
  };

  const handleGenerateQuizClick = (file: FileUpload) => {
    setSelectedFile(file);
    setShowQuizDialog(true);
  };

  const handleGenerateQuiz = async () => {
    if (!selectedFile) return;
    const file = selectedFile;

    try {
      setFiles((prev) =>
        prev.map((f) => (f.id === file.id ? { ...f, generating: true } : f))
      );

      // If the file hasn't been uploaded yet, upload it first
      if (!file.serverResponse?.pdf_id && file.raw) {
        const form = new FormData();
        form.append("file", file.raw, file.raw.name);
        form.append("subject", file.subject);

        const uploadResponse = await fetch("http://localhost:8000/pdf/upload", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("access_token")}`,
          },
          body: form,
        });

        if (!uploadResponse.ok) {
          throw new Error(
            `Upload failed: ${uploadResponse.status} ${uploadResponse.statusText}`
          );
        }

        const uploadData = await uploadResponse.json();
        file.serverResponse = uploadData;

        // Update the file in state with the server response
        setFiles((prev) =>
          prev.map((f) =>
            f.id === file.id ? { ...f, serverResponse: uploadData } : f
          )
        );
      }

      if (!file.serverResponse?.pdf_id) {
        throw new Error(
          "Could not get PDF ID. Please try uploading the file again."
        );
      }

      const response = await fetch(
        `http://localhost:8000/quiz/generate/${file.serverResponse.pdf_id}`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("access_token")}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            num_questions: numQuestions,
            difficulty_range: [minDifficulty, maxDifficulty],
          }),
        }
      );

      if (!response.ok) {
        throw new Error(
          `Failed to generate quiz: ${response.status} ${response.statusText}`
        );
      }

      const quizData = await response.json();

      // Close dialog and navigate to quizzes page
      setShowQuizDialog(false);
      setSelectedFile(null);
      navigate("/dashboard/quizzes", {
        state: { newQuiz: quizData, shouldRefresh: true },
      });
    } catch (error) {
      console.error("Failed to generate quiz:", error);
      // Show error in UI
      setFiles((prev) =>
        prev.map((f) =>
          f.id === file.id
            ? {
                ...f,
                serverError:
                  error instanceof Error
                    ? error.message
                    : "Failed to generate quiz",
              }
            : f
        )
      );
    } finally {
      setFiles((prev) =>
        prev.map((f) => (f.id === file.id ? { ...f, generating: false } : f))
      );
    }
  };

  return (
    <motion.div
      className="space-y-8"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <motion.div variants={itemVariants} className="flex items-center gap-4">
        <motion.img
          src="/mascot-owl.png"
          alt="File Upload Mascot"
          className="w-16 h-16 object-contain"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
        />
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            File Uploads
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Upload and manage your learning materials
          </p>
        </div>
      </motion.div>

      {/* Upload Area */}
      <motion.div variants={itemVariants}>
        <Card className="p-8">
          <div
            className={`relative border-2 border-dashed rounded-2xl p-12 text-center transition-all duration-300 ${
              isDragOver
                ? "border-blue-500 bg-blue-50 dark:bg-blue-950/20"
                : "border-gray-300 dark:border-gray-600 hover:border-blue-400 hover:bg-gray-50 dark:hover:bg-gray-800/50"
            }`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <motion.div
              className="space-y-6"
              animate={{ scale: isDragOver ? 1.05 : 1 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
            >
              <div className="mx-auto w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center">
                <Upload className="h-8 w-8 text-white" />
              </div>

              <div className="space-y-2">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                  {isDragOver ? "Drop files here" : "Upload your files"}
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Drag and drop files here, or click to browse
                </p>
              </div>

              <div className="space-y-4">
                <input
                  type="file"
                  multiple
                  onChange={handleFileInputChange}
                  className="hidden"
                  ref={fileInputRef}
                  accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png,.gif,.mp4,.avi,.mp3,.wav"
                />
                <Button
                  className="cursor-pointer"
                  onClick={handleChooseFilesClick}
                >
                  Choose Files
                </Button>
                <p className="text-xs text-gray-500 dark:text-gray-400"></p>
              </div>
            </motion.div>
          </div>
        </Card>
      </motion.div>

      {/* File List */}
      <motion.div variants={itemVariants}>
        <Card className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
              Uploaded Files ({files.length})
            </h2>
          </div>

          <div className="space-y-4">
            {files.map((file, index) => (
              <motion.div
                key={file.id}
                className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <div className="flex-shrink-0">{getFileIcon(file.type)}</div>

                <div className="flex-grow min-w-0">
                  <h3 className="font-medium text-gray-900 dark:text-gray-100 truncate">
                    {file.name}
                  </h3>
                  {file.subject && (
                    <p className="text-xs text-blue-600 dark:text-blue-400 font-semibold">
                      Subject: {file.subject}
                    </p>
                  )}
                  <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                    <span>{formatFileSize(file.size)}</span>
                    <span>•</span>
                    <span>{file.uploadedAt.toLocaleDateString()}</span>
                  </div>

                  {file.progress < 100 ? (
                    <div className="mt-2">
                      <Progress value={file.progress} className="h-2" />
                      <p className="text-xs text-gray-500 mt-1">
                        Uploading... {Math.round(file.progress)}%
                      </p>
                    </div>
                  ) : (
                    <div className="mt-2">
                      <span className="inline-flex items-center gap-1 text-xs text-green-600 dark:text-green-400">
                        ✓ Upload complete
                      </span>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  {file.progress === 100 && (
                    <>
                      {/* Show Generate Quiz for all PDFs */}
                      {file.type === "application/pdf" && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleGenerateQuizClick(file)}
                          disabled={file.generating}
                        >
                          {file.generating ? "Generating..." : "Generate Quiz"}
                        </Button>
                      )}
                    </>
                  )}
                </div>
              </motion.div>
            ))}

            {files.length === 0 && (
              <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                <motion.img
                  src="/mascot-owl.png"
                  alt="No Files Mascot"
                  className="w-24 h-24 object-contain mx-auto mb-4 opacity-70"
                  initial={{ scale: 0, rotate: -10 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: "spring", stiffness: 200, delay: 0.3 }}
                />
                <p>No files uploaded yet</p>
                <p className="text-sm">Upload your first file to get started</p>
              </div>
            )}
          </div>
        </Card>
      </motion.div>

      {/* Upload Statistics */}
      <motion.div variants={itemVariants}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="p-6 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950/20 dark:to-blue-900/20 border-blue-200 dark:border-blue-800">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-500 rounded-xl">
                <FileText className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-blue-700 dark:text-blue-300">
                  {files.filter((f) => f.progress === 100).length}
                </h3>
                <p className="text-blue-600 dark:text-blue-400 font-medium">
                  Total Files
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-6 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950/20 dark:to-green-900/20 border-green-200 dark:border-green-800">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-green-500 rounded-xl">
                <Upload className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-green-700 dark:text-green-300">
                  {formatFileSize(
                    files.reduce((acc, file) => acc + file.size, 0)
                  )}
                </h3>
                <p className="text-green-600 dark:text-green-400 font-medium">
                  Total Size
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-6 bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950/20 dark:to-purple-900/20 border-purple-200 dark:border-purple-800">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-purple-500 rounded-xl">
                <Video className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-purple-700 dark:text-purple-300">
                  {files.filter((f) => f.type.startsWith("video/")).length}
                </h3>
                <p className="text-purple-600 dark:text-purple-400 font-medium">
                  Video Files
                </p>
              </div>
            </div>
          </Card>
        </div>
      </motion.div>

      {/* Quiz Generation Dialog */}
      <Dialog open={showQuizDialog} onOpenChange={setShowQuizDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Generate Quiz</DialogTitle>
            <DialogDescription>
              Configure your quiz settings for "{selectedFile?.name}"
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Number of Questions</label>
              <Input
                type="number"
                min="1"
                max="20"
                value={numQuestions}
                onChange={(e) => setNumQuestions(parseInt(e.target.value) || 5)}
                placeholder="5"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Difficulty Range</label>
              <div className="flex gap-2 items-center">
                <div className="flex-1">
                  <label className="text-xs text-gray-500">Min</label>
                  <Input
                    type="number"
                    min="1"
                    max="5"
                    value={minDifficulty}
                    onChange={(e) =>
                      setMinDifficulty(parseInt(e.target.value) || 1)
                    }
                    placeholder="1"
                  />
                </div>
                <span className="text-gray-400">to</span>
                <div className="flex-1">
                  <label className="text-xs text-gray-500">Max</label>
                  <Input
                    type="number"
                    min="1"
                    max="5"
                    value={maxDifficulty}
                    onChange={(e) =>
                      setMaxDifficulty(parseInt(e.target.value) || 3)
                    }
                    placeholder="3"
                  />
                </div>
              </div>
              <p className="text-xs text-gray-500">
                Difficulty scale: 1 (Easy) to 5 (Very Hard)
              </p>
              {minDifficulty > maxDifficulty && (
                <p className="text-xs text-red-500">
                  Minimum difficulty cannot be greater than maximum difficulty
                </p>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowQuizDialog(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleGenerateQuiz}
              disabled={
                selectedFile?.generating || minDifficulty > maxDifficulty
              }
            >
              {selectedFile?.generating ? "Generating..." : "Generate Quiz"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
};

export default UploadPage;
