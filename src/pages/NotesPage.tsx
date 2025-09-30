import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Card } from "../components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "../components/ui/dialog";
import apiClient from "../lib/apiClient";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";

interface Note {
  id: string;
  pdf_id: string;
  pdf_title: string;
  created_at: string;
  updated_at: string;
  estimated_study_time: string;
  study_priority: string;
  study_notes: string; // This contains the markdown content
  topics_covered: string[];
  weak_topics: string[];
  performance_summary: {
    correct_answers: number;
    total_questions: number;
    score: number;
    level: string;
  };
  next_review_date: string;
  quiz_attempt_id: string;
  relevant_content_sources: number;
  generated_at: string;
  user_id: string;
}

interface ApiResponse {
  total_notes: number;
  pdfs_with_notes: number;
  notes_by_pdf: {
    pdf_id: string;
    pdf_title: string;
    notes: Note[];
  }[];
}

const NotesPage: React.FC = () => {
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [selectedNoteContent, setSelectedNoteContent] = useState<string>("");
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);

  // Fetch all notes on component mount
  useEffect(() => {
    const fetchNotes = async () => {
      try {
        setLoading(true);

        const response = await apiClient.get("/notes/user/all");
        const apiResponse: ApiResponse = response.data;

        // Flatten notes from all PDFs into a single array
        const allNotes: Note[] = [];
        apiResponse.notes_by_pdf.forEach((pdfData) => {
          allNotes.push(...pdfData.notes);
        });

        // Sort by creation date (newest first)
        allNotes.sort(
          (a, b) =>
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );

        setNotes(allNotes);
      } catch (error) {
        console.error("Failed to fetch notes:", error);
        // Handle error - maybe show toast or error message
      } finally {
        setLoading(false);
      }
    };

    fetchNotes();
  }, []);

  // Function to display note content in dialog
  const displayNoteContent = (note: Note) => {
    setSelectedNote(note);
    setSelectedNoteContent(note.study_notes);
    setIsDialogOpen(true);
  };

  const closeDialog = () => {
    setIsDialogOpen(false);
    setSelectedNote(null);
    setSelectedNoteContent("");
  };

  return (
    <motion.div
      className="space-y-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <div className="flex items-center gap-4">
        <motion.img
          src="/mascot-owl.png"
          alt="Study Notes Mascot"
          className="w-16 h-16 object-contain"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
        />
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
            Study Notes
          </h1>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Browse subjects and their notes
          </p>
        </div>
      </div>

      <div className="w-full">
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <Card className="p-6">
              <div className="text-gray-600 dark:text-gray-400">
                Loading notes...
              </div>
            </Card>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {notes.map((note) => (
              <motion.div
                key={note.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                whileHover={{ y: -4 }}
                transition={{ duration: 0.2 }}
              >
                <Card
                  className="p-6 cursor-pointer transition-all hover:shadow-lg border-2 hover:border-blue-200 dark:hover:border-blue-600 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700"
                  onClick={() => displayNoteContent(note)}
                >
                  <div className="space-y-4">
                    <div>
                      <h3 className="font-bold text-lg text-gray-900 dark:text-gray-100 mb-2 line-clamp-2">
                        {note.pdf_title}
                      </h3>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          Priority:
                        </span>
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${
                            note.study_priority === "urgent"
                              ? "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300"
                              : "bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300"
                          }`}
                        >
                          {note.study_priority}
                        </span>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          Score:
                        </span>
                        <span
                          className={`font-semibold ${
                            note.performance_summary.score >= 80
                              ? "text-green-600 dark:text-green-400"
                              : note.performance_summary.score >= 60
                              ? "text-yellow-600 dark:text-yellow-400"
                              : "text-red-600 dark:text-red-400"
                          }`}
                        >
                          {note?.performance_summary?.score !== undefined
                            ? note.performance_summary.score.toFixed(2)
                            : ""}
                          %
                        </span>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          Questions:
                        </span>
                        <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                          {note.performance_summary.correct_answers}/
                          {note.performance_summary.total_questions}
                        </span>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          Study Time:
                        </span>
                        <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                          {note.estimated_study_time}
                        </span>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-gray-100 dark:border-gray-700">
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        Created:{" "}
                        {new Date(note.created_at).toLocaleDateString()}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        Review:{" "}
                        {new Date(note.next_review_date).toLocaleDateString()}
                      </div>
                    </div>

                    {note.topics_covered.length > 0 && (
                      <div className="pt-2">
                        <div className="flex flex-wrap gap-1">
                          {note.topics_covered
                            .slice(0, 3)
                            .map((topic, index) => (
                              <span
                                key={index}
                                className="bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-xs px-2 py-1 rounded-full"
                              >
                                {topic}
                              </span>
                            ))}
                          {note.topics_covered.length > 3 && (
                            <span className="bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-xs px-2 py-1 rounded-full">
                              +{note.topics_covered.length - 3} more
                            </span>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        )}

        {notes.length === 0 && !loading && (
          <div className="flex justify-center items-center py-12">
            <Card className="p-8 text-center">
              <motion.img
                src="/mascot-owl.png"
                alt="No Notes Mascot"
                className="w-24 h-24 object-contain mx-auto mb-4 opacity-70"
                initial={{ scale: 0, rotate: -10 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: "spring", stiffness: 200, delay: 0.3 }}
              />
              <div className="text-gray-600 dark:text-gray-400">
                <h3 className="text-lg font-medium mb-2 text-gray-900 dark:text-gray-100">
                  No notes available
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Complete some quizzes to generate study notes
                </p>
              </div>
            </Card>
          </div>
        )}
      </div>

      {/* Note Details Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={closeDialog}>
        <DialogContent className="max-w-5xl w-[90vw] h-[85vh] flex flex-col p-0">
          <DialogHeader className="px-6 pt-6 pb-4 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 sticky top-0 z-10">
            <DialogTitle className="text-xl font-bold text-gray-900 dark:text-gray-100">
              {selectedNote?.pdf_title}
            </DialogTitle>
            <DialogDescription asChild>
              <div className="flex flex-wrap gap-4 text-sm text-gray-600 dark:text-gray-400 mt-2">
                <span>
                  Priority:{" "}
                  <span
                    className={`font-medium ${
                      selectedNote?.study_priority === "urgent"
                        ? "text-red-600 dark:text-red-400"
                        : "text-orange-600 dark:text-orange-400"
                    }`}
                  >
                    {selectedNote?.study_priority}
                  </span>
                </span>
                <span>
                  Score:{" "}
                  {selectedNote?.performance_summary?.score !== undefined
                    ? selectedNote.performance_summary.score.toFixed(2)
                    : ""}
                  %
                </span>
                <span>Level: {selectedNote?.performance_summary.level}</span>
                <span>Study Time: {selectedNote?.estimated_study_time}</span>
                <span>
                  Next Review:{" "}
                  {selectedNote?.next_review_date &&
                    new Date(
                      selectedNote.next_review_date
                    ).toLocaleDateString()}
                </span>
              </div>
            </DialogDescription>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto px-6 pb-6 bg-white dark:bg-gray-800">
            {selectedNote?.topics_covered &&
              selectedNote.topics_covered.length > 0 && (
                <div className="mb-6 pt-4">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Topics Covered:{" "}
                  </span>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {selectedNote.topics_covered.map((topic, index) => (
                      <span
                        key={index}
                        className="bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 text-xs px-3 py-1 rounded-full"
                      >
                        {topic}
                      </span>
                    ))}
                  </div>
                </div>
              )}

            <div
              className="prose prose-slate prose-sm max-w-none break-words
                          prose-headings:text-gray-900 dark:prose-headings:text-gray-100 prose-headings:font-semibold prose-headings:break-words
                          prose-h1:text-2xl prose-h1:mb-4 prose-h1:mt-6 prose-h1:leading-tight
                          prose-h2:text-xl prose-h2:mb-3 prose-h2:mt-5 prose-h2:leading-tight
                          prose-h3:text-lg prose-h3:mb-2 prose-h3:mt-4 prose-h3:leading-tight
                          prose-h4:text-base prose-h4:mb-2 prose-h4:mt-3 prose-h4:leading-tight
                          prose-p:text-gray-700 dark:prose-p:text-gray-300 prose-p:leading-relaxed prose-p:mb-4 prose-p:break-words prose-p:text-base
                          prose-strong:text-gray-900 dark:prose-strong:text-gray-100 prose-strong:font-semibold prose-strong:break-words
                          prose-em:text-gray-700 dark:prose-em:text-gray-300 prose-em:italic prose-em:break-words
                          prose-code:text-gray-900 dark:prose-code:text-gray-100 prose-code:bg-gray-100 dark:prose-code:bg-gray-700 prose-code:px-2 prose-code:py-1 prose-code:rounded prose-code:text-sm prose-code:font-mono prose-code:break-words prose-code:whitespace-pre-wrap
                          prose-pre:bg-gray-100 dark:prose-pre:bg-gray-700 prose-pre:border prose-pre:border-gray-300 dark:prose-pre:border-gray-600 prose-pre:rounded-lg prose-pre:p-4 prose-pre:overflow-x-hidden prose-pre:whitespace-pre-wrap prose-pre:break-words
                          prose-blockquote:border-l-4 prose-blockquote:border-blue-500 dark:prose-blockquote:border-blue-400 prose-blockquote:pl-4 prose-blockquote:italic prose-blockquote:text-gray-600 dark:prose-blockquote:text-gray-400 prose-blockquote:break-words prose-blockquote:bg-blue-50 dark:prose-blockquote:bg-blue-900/20 prose-blockquote:py-2 prose-blockquote:rounded-r
                          prose-ul:list-disc prose-ul:ml-6 prose-ul:mb-4 prose-ul:break-words
                          prose-ol:list-decimal prose-ol:ml-6 prose-ol:mb-4 prose-ol:break-words
                          prose-li:mb-2 prose-li:text-gray-700 dark:prose-li:text-gray-300 prose-li:leading-relaxed prose-li:break-words prose-li:text-base
                          prose-a:text-blue-600 dark:prose-a:text-blue-400 prose-a:underline prose-a:break-words hover:prose-a:text-blue-800 dark:hover:prose-a:text-blue-300
                          prose-table:w-full prose-table:border-collapse prose-table:text-sm prose-table:break-words
                          prose-th:border prose-th:border-gray-300 dark:prose-th:border-gray-600 prose-th:bg-gray-50 dark:prose-th:bg-gray-700 prose-th:p-3 prose-th:text-left prose-th:font-semibold prose-th:text-gray-900 dark:prose-th:text-gray-100
                          prose-td:border prose-td:border-gray-300 dark:prose-td:border-gray-600 prose-td:p-3 prose-td:text-gray-700 dark:prose-td:text-gray-300 prose-td:break-words
                          prose-hr:border-gray-300 dark:prose-hr:border-gray-600 prose-hr:my-6
                          prose-img:rounded-lg prose-img:shadow-sm prose-img:max-w-full prose-img:h-auto"
            >
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                rehypePlugins={[rehypeRaw]}
                components={{
                  // Custom components to ensure proper text wrapping
                  code: ({ children, className, ...props }: any) => {
                    const isInline = !className?.includes("language-");
                    return isInline ? (
                      <code
                        className="bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100 px-2 py-1 rounded text-sm font-mono break-words whitespace-pre-wrap"
                        {...props}
                      >
                        {children}
                      </code>
                    ) : (
                      <pre className="bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg p-4 overflow-x-hidden whitespace-pre-wrap break-words">
                        <code
                          className="text-gray-900 dark:text-gray-100 text-sm font-mono"
                          {...props}
                        >
                          {children}
                        </code>
                      </pre>
                    );
                  },
                  p: ({ children }) => (
                    <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4 break-words text-base">
                      {children}
                    </p>
                  ),
                  h1: ({ children }) => (
                    <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-4 mt-6 leading-tight break-words">
                      {children}
                    </h1>
                  ),
                  h2: ({ children }) => (
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-3 mt-5 leading-tight break-words">
                      {children}
                    </h2>
                  ),
                  h3: ({ children }) => (
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2 mt-4 leading-tight break-words">
                      {children}
                    </h3>
                  ),
                  h4: ({ children }) => (
                    <h4 className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-2 mt-3 leading-tight break-words">
                      {children}
                    </h4>
                  ),
                  ul: ({ children }) => (
                    <ul className="list-disc ml-6 mb-4 break-words">
                      {children}
                    </ul>
                  ),
                  ol: ({ children }) => (
                    <ol className="list-decimal ml-6 mb-4 break-words">
                      {children}
                    </ol>
                  ),
                  li: ({ children }) => (
                    <li className="mb-2 text-gray-700 dark:text-gray-300 leading-relaxed break-words text-base">
                      {children}
                    </li>
                  ),
                  blockquote: ({ children }) => (
                    <blockquote className="border-l-4 border-blue-500 dark:border-blue-400 pl-4 italic text-gray-600 dark:text-gray-400 break-words bg-blue-50 dark:bg-blue-900/20 py-2 rounded-r my-4">
                      {children}
                    </blockquote>
                  ),
                  strong: ({ children }) => (
                    <strong className="text-gray-900 dark:text-gray-100 font-semibold break-words">
                      {children}
                    </strong>
                  ),
                  em: ({ children }) => (
                    <em className="text-gray-700 dark:text-gray-300 italic break-words">
                      {children}
                    </em>
                  ),
                }}
              >
                {selectedNoteContent}
              </ReactMarkdown>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
};

export default NotesPage;
