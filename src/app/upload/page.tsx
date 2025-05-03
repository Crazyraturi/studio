// src/app/upload/page.tsx
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
import { Upload, FileText, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { useAppData } from '@/context/AppDataContext'; // Import useAppData

// Define the structure for parsed data, allowing extra columns
interface ParsedRecipientData {
  FirstName: string;
  Email: string;
  Organization: string;
  Achievement: string;
  Role: string;
  [key: string]: string; // Allow for any extra columns
}

export default function UploadCsvPage() {
  const { addRecipients } = useAppData(); // Get addRecipients action from context
  const [file, setFile] = useState<File | null>(null);
  const [fileName, setFileName] = useState<string>('');
  const [previewData, setPreviewData] = useState<ParsedRecipientData[]>([]);
  const [parsedDataForUpload, setParsedDataForUpload] = useState<ParsedRecipientData[]>([]); // Store all valid parsed data
  const [headers, setHeaders] = useState<string[]>([]);
  const [isParsing, setIsParsing] = useState<boolean>(false);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const { toast } = useToast();

  const requiredHeaders = ['FirstName', 'Email', 'Organization', 'Achievement', 'Role'];

  const resetState = () => {
      setFile(null);
      setFileName('');
      setPreviewData([]);
      setParsedDataForUpload([]);
      setHeaders([]);
      setIsParsing(false);
      setIsUploading(false);
      setUploadStatus('idle');
       // Clear the file input visually
      const fileInput = document.getElementById('csv-upload') as HTMLInputElement;
      if (fileInput) {
          fileInput.value = '';
      }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      if (selectedFile.type !== 'text/csv') {
         toast({
           title: 'Invalid File Type',
           description: 'Please upload a CSV file.',
           variant: 'destructive',
         });
         resetState(); // Reset on error
         return;
      }
      // Reset state before parsing new file
      resetState();
      setFile(selectedFile);
      setFileName(selectedFile.name);
      parseCsv(selectedFile);
    } else {
       resetState(); // Reset if no file is selected (e.g., user cancels)
    }
  };

  const parseCsv = (fileToParse: File) => {
    setIsParsing(true);
    setUploadStatus('idle'); // Reset upload status during parse
    Papa.parse<ParsedRecipientData>(fileToParse, {
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
            resetState(); // Reset on error
        } else if (results.data.length === 0) {
            toast({
                title: "Empty or Invalid CSV",
                description: "The CSV file is empty or doesn't contain valid data rows.",
                variant: "destructive",
            });
            setUploadStatus('error');
            resetState(); // Reset on error
        } else {
            const parsedHeaders = results.meta.fields;
            if (!parsedHeaders || parsedHeaders.length === 0) {
                 toast({
                    title: "Missing Headers",
                    description: "Could not detect headers. Ensure the first row contains headers like FirstName, Email, etc.",
                    variant: "destructive",
                 });
                 setUploadStatus('error');
                 resetState(); // Reset on error
                 setIsParsing(false);
                 return;
            }
            setHeaders(parsedHeaders);

            const missingHeaders = requiredHeaders.filter(h => !parsedHeaders.includes(h));
            if (missingHeaders.length > 0) {
                 toast({
                    title: "Missing Required Headers",
                    description: `The file is missing: ${missingHeaders.join(', ')}. Please correct the CSV.`,
                    variant: "destructive",
                 });
                 setUploadStatus('error');
                 // Don't reset file here, allow user to potentially re-upload corrected one
                 setFile(null); // But clear the file state to prevent upload
                 setFileName('');
                 setPreviewData([]);
                 setParsedDataForUpload([]);
            } else {
                 // Validate data integrity (basic check for required fields)
                 const validData = results.data.filter(row =>
                    requiredHeaders.every(header => row[header] !== undefined && row[header] !== '')
                 );

                 if (validData.length === 0) {
                     toast({
                         title: "No Valid Data",
                         description: "No rows with all required fields (FirstName, Email, etc.) found.",
                         variant: "destructive",
                     });
                     setUploadStatus('error');
                     setFile(null); // Prevent upload
                     setFileName('');
                     setPreviewData([]);
                     setParsedDataForUpload([]);
                 } else {
                      if (validData.length < results.data.length) {
                           toast({
                               title: "Partial Data Invalid",
                               description: `${results.data.length - validData.length} rows were skipped due to missing required data.`,
                               variant: "default", // Use default variant for info
                           });
                      }
                     setPreviewData(validData.slice(0, 5)); // Show preview of valid data
                     setParsedDataForUpload(validData); // Store all valid data for upload
                     setUploadStatus('idle'); // Ready to upload
                 }
            }
        }
        setIsParsing(false);
      },
       error: (error) => {
          console.error("CSV Parsing failed:", error);
          toast({
            title: 'CSV Parsing Failed',
            description: `An error occurred: ${error.message}. Check console for details.`,
            variant: 'destructive',
          });
          setUploadStatus('error');
          resetState(); // Reset on error
      }
    });
  };

   const handleUpload = async () => {
       if (!file || parsedDataForUpload.length === 0) {
           toast({ title: 'Cannot Upload', description: 'Please select a valid CSV file with data.', variant: 'destructive' });
           return;
       }

        if (uploadStatus === 'error') {
             toast({ title: 'Cannot Upload', description: 'Please fix the errors in the CSV file before uploading.', variant: 'destructive' });
             return;
        }

       setIsUploading(true);
       setUploadStatus('idle');

       // Simulate API call (optional) - replace if needed
       await new Promise(resolve => setTimeout(resolve, 500));

       try {
           // Prepare data for the context (map ParsedRecipientData to the format expected by addRecipients)
            const recipientsToAdd = parsedDataForUpload.map(row => ({
                firstName: row.FirstName,
                email: row.Email,
                organization: row.Organization,
                achievement: row.Achievement,
                role: row.Role,
                // Include other non-required fields if your Recipient type supports them
            }));

           addRecipients(recipientsToAdd); // Add parsed data to global state via context

           console.log('Upload successful, added recipients:', recipientsToAdd.length);
           setUploadStatus('success');
           toast({ title: 'Upload Successful', description: `${recipientsToAdd.length} recipients added.` });

           // Optionally reset after successful upload
           // resetState(); // Keep file info for now, or reset as needed

       } catch (error) {
         console.error('Upload processing failed:', error);
         setUploadStatus('error');
         toast({ title: 'Processing Failed', description: 'Could not add recipients to the list.', variant: 'destructive' });
       }

       setIsUploading(false);
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
            Must contain headers: <code className="font-mono text-xs bg-muted p-1 rounded">{requiredHeaders.join(', ')}</code>.
            Rows with missing required data will be skipped.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid w-full max-w-sm items-center gap-1.5">
            <Label htmlFor="csv-upload">Select CSV File</Label>
            <div className="flex items-center gap-2">
               {/* Use a key to force re-render on reset if needed, or manage input value directly */}
               <Input id="csv-upload" type="file" accept=".csv" onChange={handleFileChange} className="cursor-pointer" disabled={isParsing || isUploading} />
                <Button onClick={() => document.getElementById('csv-upload')?.click()} variant="outline" size="icon" aria-label="Select file" disabled={isParsing || isUploading}>
                    <Upload className="h-4 w-4" />
                </Button>
            </div>

            {fileName && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground mt-2">
                <FileText className="h-4 w-4" />
                <span>{fileName}</span>
                 {(isParsing || isUploading) && <Loader2 className="h-4 w-4 animate-spin ml-2" />}
              </div>
            )}
             {!fileName && !isParsing && (
                 <p className="text-xs text-muted-foreground mt-1">No file selected.</p>
             )}
          </div>

           {previewData.length > 0 && !isParsing && (
             <div className="space-y-2">
                <Label>Data Preview (First {previewData.length} Valid Rows)</Label>
                <ScrollArea className="h-60 w-full rounded-md border">
                   <Table>
                     <TableHeader>
                       <TableRow>
                         {headers.map((header) => (
                           <TableHead key={header} className={requiredHeaders.includes(header) ? 'font-semibold' : ''}>
                               {header}
                               {requiredHeaders.includes(header) && <span className="text-destructive">*</span>}
                           </TableHead>
                         ))}
                       </TableRow>
                     </TableHeader>
                     <TableBody>
                       {previewData.map((row, rowIndex) => (
                         <TableRow key={rowIndex}>
                           {headers.map((header) => (
                             <TableCell key={`${rowIndex}-${header}`} className="truncate max-w-[150px] text-xs">
                               {row[header] ?? <span className="text-muted-foreground italic">empty</span>}
                              </TableCell>
                           ))}
                         </TableRow>
                       ))}
                     </TableBody>
                   </Table>
                </ScrollArea>
                <p className="text-xs text-muted-foreground">Showing a preview of the first few valid rows found ({parsedDataForUpload.length} total valid rows).</p>
             </div>
           )}

            {uploadStatus === 'success' && (
                 <div className="flex items-center gap-2 text-green-600">
                     <CheckCircle className="h-5 w-5" />
                     <span>Upload successful! {parsedDataForUpload.length} recipients added.</span>
                 </div>
             )}
             {uploadStatus === 'error' && !isParsing && (
                 <div className="flex items-center gap-2 text-destructive">
                     <AlertCircle className="h-5 w-5" />
                     <span>Upload failed or file invalid. Please check errors and try again.</span>
                 </div>
             )}

        </CardContent>
        <CardFooter className="flex justify-between items-center">
           <Button onClick={handleUpload} disabled={!file || isParsing || isUploading || uploadStatus === 'error' || parsedDataForUpload.length === 0}>
            {isUploading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Upload className="mr-2 h-4 w-4" />}
            {isUploading ? 'Processing...' : `Upload ${parsedDataForUpload.length} Recipients`}
           </Button>
            {file && (
                <Button variant="outline" onClick={resetState} disabled={isParsing || isUploading}>Clear</Button>
            )}
        </CardFooter>
      </Card>
    </div>
  );
}
