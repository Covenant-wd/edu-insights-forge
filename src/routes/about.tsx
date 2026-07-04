import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, ExternalLink, GraduationCap, School, MonitorCheck, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AdSlot } from "@/components/ad-slot";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "Academia HQ Blog" },
      { name: "description", content: "Welcome to Academia HQ Blog. Learn about Academia HQ, a CBT and School Management System built for schools, students and teachers across Nigeria and Africa." },
      { property: "og:title", content: "Academia HQ Blog" },
      { property: "og:description", content: "Welcome to Academia HQ Blog. Learn about Academia HQ, a CBT and School Management System built for schools, students and teachers across Nigeria and Africa." },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "https://blog.academiahq.pro/about" },
      { name: "twitter:card", content: "summary" },
    ],
    links: [{ rel: "canonical", href: "https://blog.academiahq.pro/about" }],
  }),
  component: About,
});

function About() {
  return (
    <div className="container-blog py-10 md:py-16">
      <div className="max-w-3xl mx-auto">
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-primary transition"
        >
          <ArrowLeft className="h-4 w-4" /> Back to homepage
        </Link>

        <div className="mt-6 rounded-2xl border border-border/60 bg-card p-6 md:p-10 shadow-card">
          <div className="inline-flex items-center gap-2 rounded-full border border-border bg-background/60 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-primary">
            <GraduationCap className="h-3.5 w-3.5" /> About Us
          </div>

          <h1 className="mt-5 text-3xl md:text-5xl font-extrabold tracking-tight leading-tight">
            Welcome to Academia HQ Blog
          </h1>

          <p className="mt-5 text-lg text-muted-foreground leading-relaxed">
            Academia HQ is a powerful <strong>CBT (Computer-Based Testing) and School Management System</strong> designed to help schools, colleges, teachers, students and administrators across Nigeria and Africa work smarter, faster and more securely.
          </p>

          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            <FeatureCard
              icon={<MonitorCheck className="h-6 w-6 text-primary" />}
              title="Computer-Based Testing"
              description="Create, schedule and grade CBT exams online or offline with anti-cheating features, instant results and detailed analytics."
            />
            <FeatureCard
              icon={<School className="h-6 w-6 text-primary" />}
              title="School Management System"
              description="Manage admissions, attendance, timetables, fees, results, staff records and reports from one simple dashboard."
            />
            <FeatureCard
              icon={<FileText className="h-6 w-6 text-primary" />}
              title="Results & Reports"
              description="Generate report cards, transcripts, academic summaries and performance insights in just a few clicks."
            />
            <FeatureCard
              icon={<GraduationCap className="h-6 w-6 text-primary" />}
              title="Built for Education"
              description="Every feature is built around the real needs of Nigerian and African schools, from WAEC/NECO/JAMB readiness to local payment support."
            />
          </div>

          <div className="mt-10 space-y-5 text-base leading-relaxed text-foreground/90">
            <p>
              The <strong>Academia HQ Blog</strong> is the official education news and insights arm of Academia HQ. We publish timely updates on exams, scholarships, admission guides, teacher resources, ed-tech trends, career tips and school management best practices to help students, parents, educators and school owners stay informed and ahead.
            </p>
            <p>
              Whether you are preparing for WAEC, NECO or JAMB, searching for scholarship opportunities, or looking for smarter ways to run your school, our blog brings you reliable, well-researched content you can act on.
            </p>
            <p>
              Visit the main Academia HQ platform to explore the CBT and School Management System:
            </p>
          </div>

          <div className="mt-8">
            <a
              href="https://www.academiahq.pro"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2"
            >
              <Button size="lg" className="w-full sm:w-auto">
                Visit Academia HQ <ExternalLink className="h-4 w-4" />
              </Button>
            </a>
          </div>
        </div>

        <div className="mt-10">
          <AdSlot format="leaderboard" className="hidden md:flex" />
          <AdSlot format="mobile-banner" className="md:hidden" />
        </div>
      </div>
    </div>
  );
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-xl border border-border/60 bg-background p-5 hover:border-primary/40 transition">
      <div className="mb-3">{icon}</div>
      <h3 className="font-semibold text-foreground">{title}</h3>
      <p className="mt-1.5 text-sm text-muted-foreground">{description}</p>
    </div>
  );
}
