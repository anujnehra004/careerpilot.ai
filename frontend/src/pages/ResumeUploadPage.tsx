import React, { useState, useRef } from 'react';
import {
  FileUp,
  UploadCloud,
  CheckCircle2,
  AlertCircle,
  FileText,
  Sparkles,
  ArrowRight,
  Briefcase,
  GraduationCap,
  Award,
  Cpu,
  Layers,
  X,
} from 'lucide-react';
import { api } from '../services/api';
import { ResumeUploadResponse } from '../types';

interface ResumeUploadPageProps {
  onNavigate: (path: string) => void;
  onSelectResumeForAnalysis?: (resumeId: string) => void;
}

export const ResumeUploadPage: React.FC<ResumeUploadPageProps> = ({
  onNavigate,
  onSelectResumeForAnalysis,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragActive, setDragActive] = useState<boolean>(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [uploading, setUploading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [uploadResult, setUploadResult] = useState<ResumeUploadResponse | null>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const validateFile = (file: File): boolean => {
    const validExtensions = ['.pdf', '.docx', '.doc'];
    const fileName = file.name.toLowerCase();
    const isValidExt = validExtensions.some((ext) => fileName.endsWith(ext));

    if (!isValidExt) {
      setError('Invalid format! Please upload a PDF (.pdf) or Word document (.docx).');
      return false;
    }

    if (file.size > 10 * 1024 * 1024) {
      setError('File size exceeds the 10MB limit. Please upload a smaller file.');
      return false;
    }

    if (file.size === 0) {
      setError('File is empty. Please upload a valid resume.');
      return false;
    }

    setError(null);
    return true;
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (validateFile(file)) {
        setSelectedFile(file);
        handleUpload(file);
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (validateFile(file)) {
        setSelectedFile(file);
        handleUpload(file);
      }
    }
  };

  const handleUpload = async (file: File) => {
    setUploading(true);
    setError(null);
    setUploadProgress(20);

    // Simulated progress steps for smooth UX
    const timer = setInterval(() => {
      setUploadProgress((prev) => (prev < 85 ? prev + 15 : prev));
    }, 200);

    try {
      const result = await api.uploadResume(file);
      clearInterval(timer);
      setUploadProgress(100);
      setUploadResult(result);
      localStorage.setItem('careerpilot_active_resume_id', result.id);
    } catch (err: any) {
      clearInterval(timer);
      setError(err?.message || 'Failed to upload and parse document.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-12">
      {/* Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
          Upload & Parse Resume
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          Upload your latest CV or resume in PDF or DOCX format for real-time text extraction and ATS grading.
        </p>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center gap-3 text-xs text-red-400">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span className="font-medium">{error}</span>
        </div>
      )}

      {/* Drag & Drop Zone */}
      {!uploadResult && (
        <div
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`relative border-2 border-dashed rounded-3xl p-10 md:p-16 text-center cursor-pointer transition-all ${
            dragActive
              ? 'border-purple-400 bg-purple-950/20 scale-[1.01]'
              : 'border-slate-800 bg-[#0a0f1f]/80 hover:border-purple-500/40 hover:bg-[#0c1328]/80'
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.docx,.doc"
            onChange={handleFileChange}
            className="hidden"
          />

          <div className="max-w-md mx-auto space-y-4 pointer-events-none">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-purple-600/20 to-blue-600/20 border border-purple-500/30 flex items-center justify-center mx-auto text-purple-400 shadow-lg">
              <UploadCloud className="w-8 h-8" />
            </div>

            <div>
              <p className="text-lg font-bold text-white">
                Drag & drop your resume here, or <span className="text-purple-400">browse files</span>
              </p>
              <p className="text-xs text-slate-400 mt-1">
                Supports PDF, DOCX (up to 10 MB). Scanned image PDFs without text are automatically flagged.
              </p>
            </div>

            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[11px] font-medium bg-slate-800/80 text-slate-300 border border-slate-700">
              <Sparkles className="w-3.5 h-3.5 text-purple-400" />
              <span>Instant PyMuPDF structural extraction</span>
            </div>
          </div>

          {/* Upload Progress Bar */}
          {uploading && (
            <div className="mt-8 max-w-sm mx-auto space-y-2">
              <div className="flex justify-between text-xs text-purple-300 font-semibold">
                <span>Extracting sections & parsing text...</span>
                <span>{uploadProgress}%</span>
              </div>
              <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-gradient-to-r from-purple-500 to-indigo-500 h-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
          )}
        </div>
      )}

      {/* Extracted Details & Preview Display */}
      {uploadResult && (
        <div className="space-y-6">
          <div className="p-4 rounded-2xl bg-emerald-950/20 border border-emerald-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center text-emerald-400">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm font-bold text-white">Resume Successfully Extracted</p>
                <p className="text-xs text-slate-400">{uploadResult.file_name} ({(uploadResult.file_size / 1024).toFixed(1)} KB)</p>
              </div>
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto">
              <button
                onClick={() => {
                  setUploadResult(null);
                  setSelectedFile(null);
                }}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
              >
                Upload Different File
              </button>
              <button
                onClick={() => {
                  if (onSelectResumeForAnalysis) {
                    onSelectResumeForAnalysis(uploadResult.id);
                  }
                  onNavigate('/analysis');
                }}
                className="flex-1 sm:flex-initial px-5 py-2.5 rounded-xl text-xs font-bold bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white shadow-lg shadow-purple-600/30 flex items-center justify-center gap-2"
              >
                <span>Run Deep AI Analysis</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Structured Extraction Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Candidate Overview */}
            <div className="p-6 rounded-2xl bg-[#0b1021] border border-slate-800 space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-purple-400 flex items-center gap-2">
                <FileText className="w-4 h-4" />
                Contact & Profile
              </h3>
              <div className="space-y-2 text-xs">
                <div>
                  <span className="text-slate-500 block">Candidate Name</span>
                  <span className="text-slate-200 font-semibold text-sm">{uploadResult.parsed_data.name}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Email Address</span>
                  <span className="text-slate-200 font-medium">{uploadResult.parsed_data.email}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Phone Number</span>
                  <span className="text-slate-200 font-medium">{uploadResult.parsed_data.phone}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Location</span>
                  <span className="text-slate-200 font-medium">{uploadResult.parsed_data.location}</span>
                </div>
              </div>
            </div>

            {/* Extracted Skills */}
            <div className="p-6 rounded-2xl bg-[#0b1021] border border-slate-800 space-y-4 md:col-span-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-blue-400 flex items-center gap-2">
                <Cpu className="w-4 h-4" />
                Detected Skills & Technologies ({uploadResult.parsed_data.skills.length})
              </h3>
              <div className="flex flex-wrap gap-2">
                {uploadResult.parsed_data.skills.map((skill, idx) => (
                  <span
                    key={idx}
                    className="px-3 py-1 rounded-lg text-xs font-medium bg-purple-500/10 text-purple-300 border border-purple-500/20"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Professional Summary */}
          <div className="p-6 rounded-2xl bg-[#0b1021] border border-slate-800 space-y-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Extracted Summary</h3>
            <p className="text-xs text-slate-300 leading-relaxed italic">
              &quot;{uploadResult.parsed_data.summary}&quot;
            </p>
          </div>

          {/* Experience & Education */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-6 rounded-2xl bg-[#0b1021] border border-slate-800 space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-2">
                <Briefcase className="w-4 h-4" />
                Work Experience
              </h3>
              {uploadResult.parsed_data.work_experience.map((exp, idx) => (
                <div key={idx} className="border-l-2 border-purple-500/40 pl-3 space-y-1">
                  <p className="text-xs font-bold text-white">{exp.position} — <span className="text-purple-300">{exp.company}</span></p>
                  <p className="text-[11px] text-slate-400">{exp.start_date} – {exp.end_date} | {exp.location}</p>
                  <ul className="list-disc list-inside text-xs text-slate-300 space-y-1 mt-1">
                    {exp.description.map((b, bIdx) => (
                      <li key={bIdx} className="leading-relaxed">{b}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>

            <div className="p-6 rounded-2xl bg-[#0b1021] border border-slate-800 space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-indigo-400 flex items-center gap-2">
                <GraduationCap className="w-4 h-4" />
                Education & Accreditations
              </h3>
              {uploadResult.parsed_data.education.map((edu, idx) => (
                <div key={idx} className="border-l-2 border-indigo-500/40 pl-3 space-y-1">
                  <p className="text-xs font-bold text-white">{edu.degree} in {edu.field_of_study}</p>
                  <p className="text-[11px] text-indigo-300">{edu.institution} ({edu.start_date} – {edu.end_date})</p>
                  <p className="text-[11px] text-slate-400">Grade / GPA: {edu.grade_or_gpa}</p>
                </div>
              ))}

              <div className="pt-3 border-t border-slate-800">
                <span className="text-[11px] font-semibold text-slate-400 block mb-2">Certifications & Honors</span>
                <div className="flex flex-wrap gap-2">
                  {uploadResult.parsed_data.certifications.concat(uploadResult.parsed_data.achievements).map((item, idx) => (
                    <span key={idx} className="px-2 py-0.5 rounded text-[11px] bg-slate-800 text-slate-300">
                      {item}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
