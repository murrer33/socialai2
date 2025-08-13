'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";

export default function CalendarPage() {
  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Content Calendar</h1>
        <p className="text-muted-foreground">
          Visualize and manage your posting schedule.
        </p>
      </div>
       <Card>
        <CardContent className="p-0">
          <Calendar
            mode="single"
            // selected={new Date()} // Can be used to highlight a date
            className="p-0"
            classNames={{
              root: "w-full",
              months: "w-full flex-col sm:flex-row",
              month: "w-full space-y-4 p-4",
              table: "w-full border-collapse space-y-1",
              head_row: "flex justify-around",
              row: "flex w-full mt-2 justify-around",
              cell: "h-24 w-full text-center text-sm p-1 relative [&:has([aria-selected])]:bg-accent first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20",
              day: "h-full w-full p-1.5 font-normal aria-selected:opacity-100 justify-start items-start flex",
            }}
            components={{
              DayContent: ({ date }) => {
                const day = date.getDate();
                if (day === 10 || day === 15 || day === 22) {
                    return (
                        <div className="w-full h-full flex flex-col items-start gap-1">
                            <div className="w-full bg-primary/20 text-primary-foreground p-1 rounded-md text-xs text-left">
                                <p className="font-semibold text-primary">Post to IG</p>
                                <p className="text-primary/80">10:00 AM</p>
                            </div>
                        </div>
                    );
                }
                if (day === 18) {
                    return (
                        <div className="w-full h-full flex flex-col items-start gap-1">
                            <div className="w-full bg-primary/20 text-primary-foreground p-1 rounded-md text-xs text-left">
                                <p className="font-semibold text-primary">Post to FB</p>
                                <p className="text-primary/80">02:30 PM</p>
                            </div>
                            <div className="w-full bg-accent/20 text-accent-foreground p-1 rounded-md text-xs text-left">
                                <p className="font-semibold text-accent">Post to LI</p>
                                <p className="text-accent/80">09:00 AM</p>
                            </div>
                        </div>
                    );
                }
                return null;
              },
            }}
          />
        </CardContent>
      </Card>
    </div>
  );
}
