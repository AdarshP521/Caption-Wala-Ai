
"use client";

import { useState, useRef, type ChangeEvent, type DragEvent } from "react";
import Image from "next/image";
import {
  Check,
  Copy,
  LoaderCircle,
  UploadCloud,
  WandSparkles,
} from "lucide-react";

import { getCaptions } from "@/app/actions";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

export function CaptionGenerator() {
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [captions, setCaptions] = useState<string[]>([]);
  const [selectedCaption, setSelectedCaption] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [style, setStyle] = useState<string>("default");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileSelect = (file: File) => {
    if (file && file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const dataUri = reader.result as string;
        setPhotoPreview(dataUri);
        generateCaptions(dataUri, style);
      };
      reader.readAsDataURL(file);
    } else {
      toast({
        variant: "destructive",
        title: "Invalid file type",
        description: "Please upload an image file.",
      });
    }
  };

  const generateCaptions = async (dataUri: string, captionStyle: string) => {
    setCaptions([]);
    setSelectedCaption(null);
    setIsLoading(true);

    const result = await getCaptions({
      photoDataUri: dataUri,
      style: captionStyle === "default" ? undefined : captionStyle,
    });

    setIsLoading(false);
    if ("error" in result) {
      toast({
        variant: "destructive",
        title: "Something went wrong",
        description: result.error,
      });
      // Don't clear preview on re-generation error
    } else {
      setCaptions(result.captions);
    }
  };

  const onFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const onDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleCopy = () => {
    if (selectedCaption) {
      navigator.clipboard.writeText(selectedCaption);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    }
  };

  const handleStyleChange = (newStyle: string) => {
    setStyle(newStyle);
    if (photoPreview) {
      generateCaptions(photoPreview, newStyle);
    }
  };

  const resetState = () => {
    setPhotoPreview(null);
    setCaptions([]);
    setSelectedCaption(null);
    setIsLoading(false);
    setStyle("default");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <Card className="w-full max-w-4xl mx-auto shadow-lg overflow-hidden border-none bg-card/80 backdrop-blur-sm">
      <div className="grid md:grid-cols-2 min-h-[500px]">
        <div
          className={cn(
            "p-6 flex flex-col justify-center transition-all duration-300",
            photoPreview ? "border-r" : "col-span-full"
          )}
        >
          <input
            type="file"
            ref={fileInputRef}
            onChange={onFileChange}
            accept="image/*"
            className="hidden"
          />
          {photoPreview ? (
            <div className="space-y-4 animate-fade-in">
              <div className="relative w-full aspect-1">
                <Image
                  src={photoPreview}
                  alt="Uploaded preview"
                  fill
                  className="object-cover rounded-lg shadow-md"
                />
              </div>
               <div className="space-y-2">
                <Label htmlFor="style-select">Caption Style</Label>
                <Select value={style} onValueChange={handleStyleChange}>
                  <SelectTrigger id="style-select" className="w-full">
                    <SelectValue placeholder="Select a style" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="default">Default</SelectItem>
                    <SelectItem value="witty">Witty</SelectItem>
                    <SelectItem value="poetic">Poetic</SelectItem>
                    <SelectItem value="casual">Casual</SelectItem>
                    <SelectItem value="professional">Professional</SelectItem>
                    <SelectItem value="bold">Bold</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button onClick={resetState} variant="outline" className="w-full">
                Upload Another Photo
              </Button>
            </div>
          ) : (
            <div
              className={cn(
                "w-full h-full border-2 border-dashed rounded-lg flex flex-col items-center justify-center text-center p-8 cursor-pointer hover:border-primary hover:bg-accent transition-colors",
                isDragging && "border-primary bg-accent"
              )}
              onClick={() => fileInputRef.current?.click()}
              onDragEnter={() => setIsDragging(true)}
              onDragLeave={() => setIsDragging(false)}
              onDragOver={(e) => {
                e.preventDefault();
                e.stopPropagation();
              }}
              onDrop={onDrop}
            >
              <UploadCloud className="w-12 h-12 text-muted-foreground mb-4" />
              <p className="font-semibold text-foreground">
                Click or drag & drop photo
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                Maximum file size: 5MB
              </p>
            </div>
          )}
        </div>

        {photoPreview && (
          <div className="flex flex-col animate-fade-in">
            <CardHeader>
              {isLoading ? (
                <>
                  <CardTitle className="flex items-center gap-2">
                    <LoaderCircle className="animate-spin text-primary" />
                    Generating Captions
                  </CardTitle>
                  <CardDescription>
                    Our AI is crafting some ideas for you...
                  </CardDescription>
                </>
              ) : (
                <>
                  <CardTitle className="flex items-center gap-2">
                    <WandSparkles className="text-primary" />
                    Choose Your Caption
                  </CardTitle>
                  <CardDescription>
                    Select your favorite and copy it to your clipboard.
                  </CardDescription>
                </>
              )}
            </CardHeader>

            <CardContent className="flex-grow">
              {isLoading ? (
                <div className="space-y-4 pt-2">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="flex items-center space-x-3">
                      <Skeleton className="h-4 w-4 rounded-full" />
                      <Skeleton className="h-4 flex-1" />
                    </div>
                  ))}
                </div>
              ) : (
                <ScrollArea className="h-[280px] pr-4">
                  <RadioGroup
                    onValueChange={setSelectedCaption}
                    value={selectedCaption ?? undefined}
                    className="gap-4"
                  >
                    {captions.map((caption, index) => (
                      <div
                        key={index}
                        className="flex items-start space-x-3 p-3 rounded-md hover:bg-accent transition-colors"
                      >
                        <RadioGroupItem value={caption} id={`c${index}`} />
                        <Label
                          htmlFor={`c${index}`}
                          className="font-normal -mt-1 cursor-pointer"
                        >
                          {caption}
                        </Label>
                      </div>
                    ))}
                  </RadioGroup>
                </ScrollArea>
              )}
            </CardContent>

            <CardFooter>
              <Button
                onClick={handleCopy}
                disabled={!selectedCaption || isLoading}
                className="w-full"
                size="lg"
              >
                {isCopied ? (
                  <>
                    <Check /> Copied!
                  </>
                ) : (
                  <>
                    <Copy /> Copy Caption
                  </>
                )}
              </Button>
            </CardFooter>
          </div>
        )}
      </div>
    </Card>
  );
}
