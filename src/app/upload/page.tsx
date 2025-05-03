'use client';

import React, { useState, useCallback } from 'react';
import Papa from 'papaparse';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import { Upload, FileText, CheckCircle, AlertCircle } from 'lucide-react';

interface RecipientData {
  FirstName: string;
  Email: string;
  Organization: string;
  Achievement: string;
  Role: string;
  [key: string]: string; // Allow for extra columns
}

export default function UploadCsvPage() {
  const [file, setFile] = useState<File | null>(null);
  const [fileName, setFileName] = useState<string>('');
  const [previewData, setPreviewData] = useState<RecipientData[]>([]);
  const [headers, setHeaders] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const { toast } = useToast();

  const requiredHeaders = ['FirstName', 'Email', 'Organization', 'Achievement', 'Role'];

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      if (selectedFile.type !== 'text/csv') {
         toast({
           title: 'Invalid File Type',
           description: 'Please upload a CSV file.',
           variant: 'destructive',
         });
         return;
      }
      setFile(selectedFile);
      setFileName(selectedFile.name);
      setUploadStatus('idle');
      setPreviewData([]);
      setHeaders([]);
      parseCsv(selectedFile);
    }
  };

  const parseCsv = (fileToParse: File) => {
    setIsLoading(true);
    Papa.parse<RecipientData>(fileToParse, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        if (results.errors.length > 0) {
            console.error('CSV Parsing errors:', results.errors);
            toast({
              title: 'CSV Parsing Error',
              description: `Error parsing CSV: ${results.errors[0].message}. Please check the file format.`,
              variant: 'destructive',
            });
            setUploadStatus('error');
            setFile(null);
            setFileName('');
        } else if (results.data.length === 0) {
            toast({
                title: "Empty CSV",
                description: "The uploaded CSV file appears to be empty or doesn't contain valid data rows.",
                variant: "destructive",
            });
            setUploadStatus('error');
            setFile(null);
            setFileName('');
        }
         else {
            const parsedHeaders = results.meta.fields;
            if (!parsedHeaders) {
                 toast({
                    title: "Missing Headers",
                    description: "Could not detect headers in the CSV file. Please ensure the first row contains headers.",
                    variant: "destructive",
                 });
                 setUploadStatus('error');
                 setFile(null);
                 setFileName('');
                 setIsLoading(false);
                 return;
            }
            setHeaders(parsedHeaders);

            const missingHeaders = requiredHeaders.filter(h => !parsedHeaders.includes(h));
            if (missingHeaders.length > 0) {
                 toast({
                    title: "Missing Required Headers",
                    description: `The following required headers are missing: ${missingHeaders.join(', ')}.`,
                    variant: "destructive",
                 });
                 setUploadStatus('error');
                 setFile(null);
                 setFileName('');
            } else {
                 // Limit preview to first 5 rows
                 setPreviewData(results.data.slice(0, 5));
                 setUploadStatus('idle'); // Ready to upload, but not yet uploaded
            }
        }
        setIsLoading(false);
      },
       error: (error) => {
          console.error("CSV Parsing failed:", error);
          toast({
            title: 'CSV Parsing Failed',
            description: `An unexpected error occurred while parsing the CSV. Error: ${error.message}`,
            variant: 'destructive',
          });
          setUploadStatus('error');
          setFile(null);
          setFileName('');
          setIsLoading(false);
      }
    });
  };

   const handleUpload = async () => {
       if (!file) {
           toast({ title: 'No file selected', description: 'Please select a CSV file to upload.', variant: 'destructive' });
           return;
       }

        if (uploadStatus === 'error' || headers.length === 0 || previewData.length === 0) {
             toast({ title: 'Cannot Upload', description: 'Please fix the errors in the CSV file before uploading.', variant: 'destructive' });
             return;
        }

       setIsLoading(true);
       setUploadStatus('idle');

       // Simulate API call for upload
       await new Promise(resolve => setTimeout(resolve, 1500));

       // Placeholder: In a real app, you'd send the file to your backend here
       // For example:
       // const formData = new FormData();
       // formData.append('file', file);
       // try {
       //   const response = await fetch('/api/upload-recipients', { method: 'POST', body: formData });
       //   if (!response.ok) throw new Error('Upload failed');
       //   const result = await response.json();
       //   console.log('Upload successful:', result);
       //   setUploadStatus('success');
       //   toast({ title: 'Upload Successful', description: `${result.count} recipients added.` });
       // } catch (error) {
       //   console.error('Upload failed:', error);
       //   setUploadStatus('error');
       //   toast({ title: 'Upload Failed', description: error.message || 'Could not upload the file.', variant: 'destructive' });
       // }

       // Simulate success for demo
       console.log('Simulating successful upload for file:', file.name);
       setUploadStatus('success');
       toast({ title: 'Upload Successful', description: `${file.name} processed successfully.` });


       setIsLoading(false);
   };


  return (
    <div className="p-6">
      <header className="mb-6">
        <h1 className="text-3xl font-bold text-primary">Upload Recipient CSV</h1>
        <p className="text-muted-foreground">Upload a CSV file containing recipient data for VBDA 2025 invitations.</p>
      </header>

      <Card className="card-shadow rounded-corners">
        <CardHeader>
          <CardTitle>Upload CSV File</CardTitle>
          <CardDescription>
            Ensure your CSV file has the following headers: {requiredHeaders.join(', ')}.
            Extra columns will be ignored during personalization but stored.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid w-full max-w-sm items-center gap-1.5">
            <Label htmlFor="csv-upload">Select CSV File</Label>
            <div className="flex items-center gap-2">
               <Input id="csv-upload" type="file" accept=".csv" onChange={handleFileChange} className="cursor-pointer" />
                <Button onClick={() => document.getElementById('csv-upload')?.click()} variant="outline" size="icon" aria-label="Select file">
                    <Upload className="h-4 w-4" />
                </Button>
            </div>

            {fileName && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground mt-2">
                <FileText className="h-4 w-4" />
                <span>{fileName}</span>
              </div>
            )}
          </div>

           {previewData.length > 0 && (
             <div className="space-y-2">
                <Label>Data Preview (First 5 Rows)</Label>
                <ScrollArea className="h-60 w-full rounded-md border">
                   <Table>
                     <TableHeader>
                       <TableRow>
                         {headers.map((header) => (
                           <TableHead key={header}>{header}</TableHead>
                         ))}
                       </TableRow>
                     </TableHeader>
                     <TableBody>
                       {previewData.map((row, rowIndex) => (
                         <TableRow key={rowIndex}>
                           {headers.map((header) => (
                             <TableCell key={`${rowIndex}-${header}`} className="truncate max-w-xs">{row[header]}</TableCell>
                           ))}
                         </TableRow>
                       ))}
                     </TableBody>
                   </Table>
                </ScrollArea>
             </div>
           )}

            {uploadStatus === 'success' && (
                 <div className="flex items-center gap-2 text-green-600">
                     <CheckCircle className="h-5 w-5" />
                     <span>Upload successful! Recipient data is ready.</span>
                 </div>
             )}
             {uploadStatus === 'error' && (
                 <div className="flex items-center gap-2 text-destructive">
                     <AlertCircle className="h-5 w-5" />
                     <span>Upload failed. Please check the file and try again.</span>
                 </div>
             )}

        </CardContent>
        <CardFooter>
           <Button onClick={handleUpload} disabled={!file || isLoading || uploadStatus === 'error'}>
            {isLoading ? 'Uploading...' : 'Upload and Process'}
           </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
