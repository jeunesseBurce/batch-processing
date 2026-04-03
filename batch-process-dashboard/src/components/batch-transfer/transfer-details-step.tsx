import { Input } from '../input';
import { Label } from '../label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../select';
import { Upload } from 'lucide-react';
import { useState } from 'react';

interface TransferDetailsStepProps {
  batchName: string;
  setBatchName: (value: string) => void;
  approver: string;
  setApprover: (value: string) => void;
  csvFile: File | null;
  setCsvFile: (file: File | null) => void;
  approvers: string[];
  loading: boolean;
}

export function TransferDetailsStep({
  batchName,
  setBatchName,
  approver,
  setApprover,
  csvFile,
  setCsvFile,
  approvers,
  loading,
}: TransferDetailsStepProps) {
  const [dragActive, setDragActive] = useState(false);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.type === 'text/csv' || file.name.endsWith('.csv')) {
        setCsvFile(file);
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setCsvFile(e.target.files[0]);
    }
  };

  return (
    <div className="space-y-6 py-4">
      <div className="space-y-2">
        <Label htmlFor="batch-name">Batch Transfer Name</Label>
        <Input
          id="batch-name"
          placeholder="Enter batch transfer name"
          value={batchName}
          onChange={(e) => setBatchName(e.target.value)}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="file-upload">File Upload</Label>
        <div
          className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
            dragActive
              ? 'border-blue-500 bg-blue-50'
              : 'border-gray-300 hover:border-gray-400'
          }`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <input
            id="file-upload"
            type="file"
            accept=".csv"
            onChange={handleFileChange}
            className="hidden"
          />
          <label
            htmlFor="file-upload"
            className="cursor-pointer flex flex-col items-center gap-2"
          >
            <Upload className="h-10 w-10 text-gray-400" />
            {csvFile ? (
              <>
                <p className="text-sm text-gray-700">
                  <span className="font-medium">{csvFile.name}</span>
                </p>
                <p className="text-xs text-gray-500">
                  Click to replace or drag and drop
                </p>
              </>
            ) : (
              <>
                <p className="text-sm text-gray-700">
                  <span className="font-medium">Click to upload</span> or drag and drop
                </p>
                <p className="text-xs text-gray-500">CSV files only</p>
              </>
            )}
          </label>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="approver">Approver Selection</Label>
        <Select value={approver} onValueChange={setApprover} disabled={loading}>
          <SelectTrigger id="approver">
            <SelectValue placeholder={loading ? "Loading approvers..." : "Select an approver"} />
          </SelectTrigger>
          <SelectContent>
            {approvers.map((name) => (
              <SelectItem key={name} value={name}>
                {name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}