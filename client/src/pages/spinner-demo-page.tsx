import React, { useState } from "react";
import { ThemedSpinner, spinnerThemes, type SpinnerTheme } from "@/components/ui/themed-spinner";
import { FluidSpinner } from "@/components/ui/fluid-spinner";
import PageLayout from "@/components/layout/page-layout";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";

export default function SpinnerDemoPage() {
  const [selectedTheme, setSelectedTheme] = useState<SpinnerTheme>("book");
  const [customText, setCustomText] = useState<string>("Loading...");
  const [isCustomizing, setIsCustomizing] = useState<boolean>(false);
  const [size, setSize] = useState<number>(60);

  return (
    <PageLayout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6 text-center">Course-themed Animated Loaders</h1>
        <p className="text-muted-foreground text-center mb-8 max-w-2xl mx-auto">
          Explore our collection of playful, course-themed loading animations designed to make waiting times more engaging and interactive.
        </p>

        <Tabs defaultValue="preview" className="max-w-4xl mx-auto">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="preview">Preview All</TabsTrigger>
            <TabsTrigger value="customize">Customize</TabsTrigger>
          </TabsList>
          
          <TabsContent value="preview" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {spinnerThemes.map((theme) => (
                <Card key={theme} className="flex flex-col items-center justify-center p-4 h-64 transition-all hover:shadow-md">
                  <CardHeader className="text-center pb-0">
                    <CardTitle className="capitalize">{theme} Theme</CardTitle>
                  </CardHeader>
                  <CardContent className="flex flex-col items-center justify-center gap-4 pt-4 flex-1">
                    <div className="flex items-center gap-8">
                      <ThemedSpinner theme={theme} size="lg" text="Simple" />
                      <FluidSpinner theme={theme} size={60} text="Advanced" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
          
          <TabsContent value="customize" className="mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="flex flex-col">
                <CardHeader>
                  <CardTitle>Customize Your Loader</CardTitle>
                  <CardDescription>
                    Configure the appearance and behavior of your loader
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col gap-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="spinner-theme">Theme</Label>
                      <Select 
                        value={selectedTheme} 
                        onValueChange={(value: SpinnerTheme) => setSelectedTheme(value)}
                      >
                        <SelectTrigger id="spinner-theme">
                          <SelectValue placeholder="Select theme" />
                        </SelectTrigger>
                        <SelectContent>
                          {spinnerThemes.map((theme) => (
                            <SelectItem key={theme} value={theme}>
                              <span className="capitalize">{theme}</span>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="spinner-text">Text</Label>
                      <Input 
                        id="spinner-text" 
                        placeholder="Loading text..." 
                        value={customText}
                        onChange={(e) => setCustomText(e.target.value)}
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <Label htmlFor="size-slider">Size</Label>
                      <span className="text-muted-foreground">{size}px</span>
                    </div>
                    <Slider
                      id="size-slider"
                      min={20}
                      max={120}
                      step={5}
                      value={[size]}
                      onValueChange={(value) => setSize(value[0])}
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 pt-4">
                    <Button
                      variant="outline"
                      onClick={() => {
                        setSelectedTheme("book");
                        setCustomText("Loading...");
                        setSize(60);
                      }}
                    >
                      Reset
                    </Button>
                    <Button onClick={() => setIsCustomizing(!isCustomizing)}>
                      {isCustomizing ? "Stop Animation" : "Start Animation"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Preview</CardTitle>
                  <CardDescription>
                    See your custom animations in action
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex items-center justify-center min-h-[300px]">
                  {isCustomizing ? (
                    <div className="flex flex-col items-center gap-8">
                      <ThemedSpinner 
                        theme={selectedTheme} 
                        size="xl" 
                        text={customText || undefined} 
                      />
                      <FluidSpinner 
                        theme={selectedTheme} 
                        size={size} 
                        text={customText || undefined}
                      />
                    </div>
                  ) : (
                    <p className="text-center text-muted-foreground">
                      Click "Start Animation" to preview your custom spinner.
                    </p>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </PageLayout>
  );
}