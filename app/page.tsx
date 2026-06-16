import Hero from "@/components/sections/Hero";
import About from "@/components/sections/About";
import Services from "@/components/sections/Services";
import Testimonials from "@/components/sections/Testimonials";
import HashScrollHandler from "@/components/HashScrollHandler";
import { ProfileData, Skill, Service, Project, SocialMediaLink } from "@/types";
import connectDB from "@/lib/mongoose";
import UserDetails from "@/models/UserDetails";
import AboutModel from "@/models/About";
import ServicesDetails from "@/models/ServiceDetails";
import ProjectDetails from "@/models/ProjectDetails";

export const dynamic = "force-dynamic";

async function getPortfolioData() {
  try {
    // Connect to database and fetch all details directly
    await connectDB();
    const [profileDoc, aboutDoc, servicesDocs, projectsDocs] = await Promise.all([
      UserDetails.findOne().lean(),
      AboutModel.findOne().lean(),
      ServicesDetails.find({}).lean(),
      ProjectDetails.find({}).lean(),
    ]);

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

    return { profile, aboutIntroduction, skills, services, projects };
  } catch (err) {
    console.error("Error loading portfolio details on server:", err);
    return {
      profile: {
        firstName: "",
        lastName: "",
        tagline: "",
        shortIntro: "",
        resumeUrl: "",
        profilePicUrl: "",
        socialMediaLinks: [],
      },
      aboutIntroduction: "",
      skills: [],
      services: [],
      projects: [],
    };
  }
}

export default async function Home() {
  const { profile, aboutIntroduction, skills, services, projects } = await getPortfolioData();

  const sections = [
    { id: "home", component: <Hero profile={profile} /> },
    { id: "about", component: <About introduction={aboutIntroduction} skills={skills} /> },
    { id: "services", component: <Services services={services} /> },
    { id: "testimonials", component: <Testimonials projects={projects} /> },
  ];

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
        {sections.map(({ id, component }) => (
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