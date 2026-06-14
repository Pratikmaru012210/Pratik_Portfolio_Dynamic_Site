"use client";

import { useEffect, useRef, useState } from "react";
import { testimonialsText } from "../../constants/texts";
import Card from "../Card";
import TestimonialsMoreInfo from "../TestimonialsMoreInfo";

interface Project {
  _id: string;
  projectName: string;
  description: string;
  imageUrl: string;
  gitHubLink?: string;
  liveLink?: string;
  techStack?: string[];
  problemSolve?: string;
}

interface TestimonialsProps {
  projects: Project[];
}

export default function Testimonials({ projects }: TestimonialsProps) {
  const [openModal, setOpenModal] = useState(false);
  const [selectedTestimonial, setSelectedTestimonial] = useState<Project | null>(null);
  const modalRef = useRef<HTMLDivElement | null>(null);

  // Close modal when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        modalRef.current &&
        !modalRef.current.contains(event.target as Node)
      ) {
        setOpenModal(false);
      }
    };

    if (openModal) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [openModal]);

  return (
    <section className="flex flex-col items-center w-full pt-10 pb-8 sm:pt-12 sm:pb-12 md:pt-16 md:pb-16 lg:pt-20 lg:pb-20 px-4 sm:px-6 md:px-8 lg:px-12 xl:px-20 animate-fade-in">
      {/* Label */}
      <div className="text-overline text-center mb-4 text-foreground/50">
        {testimonialsText.heading}
      </div>

      {/* Sub Heading */}
      <h1 className="text-heading text-center mb-6 bg-gradient-to-r from-foreground via-foreground/90 to-foreground/85 bg-clip-text text-transparent">
        {testimonialsText.subHeading}
      </h1>

      {/* Intro Text */}
      <div className="text-body text-foreground/80 max-w-xs sm:max-w-lg md:max-w-2xl lg:max-w-3xl xl:max-w-4xl text-center mb-12 mx-auto px-2 sm:px-4">
        {testimonialsText.introduction}
      </div>

      {/* Scrollable Container */}
      <div className="w-full overflow-x-auto scrollbar-thin scrollbar-thumb-primary/20 scrollbar-track-transparent">
        <div className="flex flex-nowrap md:justify-center gap-4 sm:gap-6 lg:gap-8 px-4 pb-4 w-max min-w-full">
          {projects.map((project, idx) => (
            <Card
              key={project._id || idx}
              testimonial={{
                title: project.projectName,
                link: project.imageUrl,
                desc: project.description,
                gitHubLink: project.gitHubLink,
                liveLink: project.liveLink,
              }}
              onMoreInfo={() => {
                setSelectedTestimonial(project);
                setOpenModal(true);
              }}
            />
          ))}
        </div>
      </div>

      {/* Testimonial More Info Modal */}
      {openModal && selectedTestimonial && (
        <TestimonialsMoreInfo
          openModal={openModal}
          setOpenModal={setOpenModal}
          modalRef={modalRef}
          data={selectedTestimonial}
        />
      )}
    </section>
  );
}
