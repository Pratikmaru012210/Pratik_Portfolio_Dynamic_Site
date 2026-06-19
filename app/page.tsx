import nextDynamic from "next/dynamic";
import Hero from "@/components/sections/Hero";
import HashScrollHandler from "@/components/HashScrollHandler";
import Fab from "@/components/Fab";
import { ProfileData, Skill, Service, Project, SocialMediaLink, DynamicSection, DynamicRecord } from "@/types";
import connectDB from "@/lib/mongoose";
import UserDetails from "@/models/UserDetails";
import AboutModel from "@/models/About";
import ServicesDetails from "@/models/ServiceDetails";
import ProjectDetails from "@/models/ProjectDetails";
import DynamicSectionModel from "@/models/DynamicSection";

const About = nextDynamic(() => import("@/components/sections/About"), { ssr: true });
const Services = nextDynamic(() => import("@/components/sections/Services"), { ssr: true });
const Testimonials = nextDynamic(() => import("@/components/sections/Testimonials"), { ssr: true });

export const dynamic = "force-dynamic";

async function getPortfolioData() {
  try {
    // Connect to database and fetch all details directly
    const startConnect = Date.now();
    await connectDB();
    const endConnect = Date.now();
    console.log(`connectDB (Home) took ${endConnect - startConnect}ms`);

    const startQueries = Date.now();
    const [profileDoc, aboutDoc, servicesDocs, projectsDocs, dynamicSectionsDocs] = await Promise.all([
      UserDetails.findOne().lean(),
      AboutModel.findOne().lean(),
      ServicesDetails.find({}).lean(),
      ProjectDetails.find({}).lean(),
      DynamicSectionModel.find({}).sort({ order: 1 }).lean(),
    ]);
    const endQueries = Date.now();
    console.log(`MongoDB Queries (Home) took ${endQueries - startQueries}ms`);

    const profile: ProfileData = profileDoc
      ? {
        firstName: profileDoc.firstName || "",
        lastName: profileDoc.lastName || "",
        tagline: profileDoc.tagline || "",
        shortIntro: profileDoc.shortIntro || "",
        resumeUrl: profileDoc.resumeUrl || "",
        profilePicUrl: profileDoc.profilePicUrl || "",
        socialMediaLinks: (profileDoc.socialMediaLinks || []).map((link: SocialMediaLink) => ({
          url: link.url || "",
          icon: link.icon || "",
          iconFileId: link.iconFileId || "",
        })),
      }
      : {
        firstName: "",
        lastName: "",
        tagline: "",
        shortIntro: "",
        resumeUrl: "",
        profilePicUrl: "",
        socialMediaLinks: [],
      };

    const aboutIntroduction = aboutDoc?.introduction || "";
    const skills: Skill[] = (aboutDoc?.skills || []).map((skill: { _id?: { toString(): string } | string; skill: string; icon: string; iconFileId?: string }) => ({
      _id: skill._id ? skill._id.toString() : "",
      skill: skill.skill || "",
      icon: skill.icon || "",
      iconFileId: skill.iconFileId || "",
    }));

    const services: Service[] = (servicesDocs || []).map((service: { _id?: { toString(): string } | string; service: string; description: string; icon: string; iconFileId?: string }) => ({
      _id: service._id ? service._id.toString() : "",
      service: service.service || "",
      description: service.description || "",
      icon: service.icon || "",
      iconFileId: service.iconFileId || "",
    }));

    const projects: Project[] = (projectsDocs || []).map((project: { _id?: { toString(): string } | string; projectName: string; imageUrl?: string; imageFileId?: string; description: string; gitHubLink?: string; liveLink?: string; techStack?: string[]; problemSolve?: string }) => ({
      _id: project._id ? project._id.toString() : "",
      projectName: project.projectName || "",
      imageUrl: project.imageUrl || "",
      imageFileId: project.imageFileId || "",
      description: project.description || "",
      gitHubLink: project.gitHubLink || "",
      liveLink: project.liveLink || "",
      techStack: project.techStack || [],
      problemSolve: project.problemSolve || "",
    }));

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const dynamicSections: DynamicSection[] = (dynamicSectionsDocs || []).map((sec: any) => ({
      _id: sec._id ? String(sec._id) : "",
      name: sec.name || "",
      description: sec.description || "",
      order: typeof sec.order === "number" ? sec.order : 0,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      records: (sec.records || []).map((rec: any) => ({
        _id: rec._id ? String(rec._id) : "",
        heading: rec.heading || "",
        description: rec.description || "",
        imageUrl: rec.imageUrl || "",
        imageFileId: rec.imageFileId || "",
        link: rec.link || "",
        tags: rec.tags || [],
      }))
    }));

    return { profile, aboutIntroduction, skills, services, projects, dynamicSections };
  } catch (err) {
    console.error("Error loading portfolio details on server:", err);
    throw err;
  }
}

export default async function Home() {
  const { profile, aboutIntroduction, skills, services, projects, dynamicSections } = await getPortfolioData();

  const sections = [
    { id: "home", component: <Hero profile={profile} /> },
    { id: "about", component: <About introduction={aboutIntroduction} skills={skills} /> },
    { id: "services", component: <Services services={services} /> },
    { id: "testimonials", component: <Testimonials projects={projects} /> },
  ];

  const dynamicSectionBlocks = (dynamicSections || []).map((sec: DynamicSection) => {
    const formattedProjects: Project[] = (sec.records || []).map((r: DynamicRecord) => ({
      _id: r._id,
      projectName: r.heading,
      description: r.description || "",
      imageUrl: r.imageUrl || "",
      imageFileId: r.imageFileId || "",
      liveLink: r.link || "",
      techStack: r.tags || [],
      problemSolve: "",
    }));

    return {
      id: `dynamic-${sec._id}`,
      component: (
        <div className="py-10">
          <div className="flex flex-col items-center w-full px-4 sm:px-6 md:px-8 lg:px-12 xl:px-20 animate-fade-in">
            <h1 className="text-heading text-center mb-6 bg-gradient-to-r from-foreground via-foreground/90 to-foreground/85 bg-clip-text text-transparent">
              {sec.name}
            </h1>
            {sec.description && (
              <div className="text-body text-foreground/80 max-w-md sm:max-w-lg md:max-w-2xl lg:max-w-3xl xl:max-w-4xl text-center mb-12 mx-auto px-2 sm:px-4">
                {sec.description}
              </div>
            )}
          </div>
          {/* We reuse the UI of Testimonials for the records */}
          <Testimonials projects={formattedProjects} hideTitle={true} />
        </div>
      ),
    };
  });

  const allSections = [...sections, ...dynamicSectionBlocks];

  return (
    <div className="relative isolate min-h-screen">
      <HashScrollHandler />
      {/* Background radial glow */}
      <div
        className="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80 pointer-events-none"
        aria-hidden="true"
      >
        <div
          className="relative left-[calc(50%-11rem)] aspect-1155/678 w-[36rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-primary to-transparent opacity-15 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem]"
          style={{
            clipPath:
              "polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)",
          }}
        />
      </div>

      <div className="max-w-7xl mx-auto divide-y divide-border/20">
        {allSections.map(({ id, component }) => (
          <div key={id} id={id} className="scroll-mt-20">
            {component}
          </div>
        ))}
      </div>

      {/* Decorative blurred background orb on right */}
      <div
        className="absolute inset-x-0 bottom-10 -z-10 transform-gpu overflow-hidden blur-3xl pointer-events-none"
        aria-hidden="true"
      >
        <div
          className="relative left-[calc(50%+3rem)] aspect-1155/678 w-[36rem] -translate-x-1/2 bg-gradient-to-tr from-primary/30 to-transparent opacity-15 sm:left-[calc(50%+36rem)] sm:w-[72.1875rem]"
          style={{
            clipPath:
              "polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)",
          }}
        />
      </div>

      {/* Float social links FAB globally pinned to viewport */}
      {profile.socialMediaLinks && profile.socialMediaLinks.length > 0 && (
        <div className="fixed bottom-0 right-0 z-[9999] pointer-events-none w-full h-full">
          <div className="absolute bottom-0 right-0 p-4 pointer-events-auto">
            <Fab actions={profile.socialMediaLinks} />
          </div>
        </div>
      )}
    </div>
  );
}