"use client";

import { useEffect, useRef, useState } from "react";
import { servicesText } from "../../constants/texts";
import CardModal from "../CardModal";

interface Service {
  _id: string;
  service: string;
  icon: string;
  description: string;
}

export default function Services() {
  const [openModal, setOpenModal] = useState(false);
  const modalRef = useRef<HTMLDivElement | null>(null);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchServices = async () => {
      try {
        setLoading(true);
        const baseUrl = process.env.NEXT_PUBLIC_BE_URL || "http://localhost:3001";
        const res = await fetch(`${baseUrl}/services`);
        const data = await res.json();
        setServices(data.data || []);
      } catch (err) {
        console.error("Error fetching services:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchServices();
  }, []);

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

  if (loading) {
    return (
      <section className="flex flex-col items-center justify-center min-h-[40vh] px-4">
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-primary border-solid mb-4"></div>
        <span className="text-primary text-lg font-medium animate-pulse">Loading Services...</span>
      </section>
    );
  }

  return (
    <>
      <section className="flex flex-col items-center w-full pt-10 pb-8 sm:pt-12 sm:pb-12 md:pt-16 md:pb-16 lg:pt-20 lg:pb-20 px-4 sm:px-6 md:px-8 lg:px-12 xl:px-20 animate-fade-in">
        {/* Label */}
        <div className="text-center mb-4 text-xs sm:text-sm md:text-base tracking-widest uppercase text-foreground/50 font-semibold">
          {servicesText.offerTxt}
        </div>

        {/* Heading */}
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-center mb-6 bg-gradient-to-r from-foreground via-foreground/90 to-foreground/85 bg-clip-text text-transparent">
          {servicesText.heading}
        </h1>

        {/* Introduction Text */}
        <div className="max-w-xs sm:max-w-lg md:max-w-2xl lg:max-w-3xl xl:max-w-4xl text-center mb-12 text-sm sm:text-base md:text-lg lg:text-xl text-foreground/80 mx-auto px-2 sm:px-4 leading-relaxed">
          {servicesText.shortIntro}
        </div>

        {/* Services List Scroll Container */}
        <div className="w-full overflow-x-auto scrollbar-thin scrollbar-thumb-primary/20 scrollbar-track-transparent">
          <div className="flex flex-nowrap md:justify-center gap-4 sm:gap-6 md:gap-8 px-4 pb-4 w-max min-w-full">
            {services.map((service) => {
              const displayIcon = service.icon && service.icon.includes("imagekit.io")
                ? `${service.icon}?tr=w-80,h-80,bg-FFFFFF00,fit-contain`
                : service.icon;
              return (
                <div
                  onClick={() => {
                    setSelectedService(service);
                    setOpenModal(true);
                  }}
                  key={service._id}
                  className="flex-shrink-0 flex flex-col items-start rounded-2xl border border-border/60 bg-background/40 p-5 sm:p-6 md:p-8 w-[85vw] max-w-[260px] sm:min-w-[260px] md:min-w-[280px] sm:max-w-[300px] md:max-w-[360px] transition-all duration-300 cursor-pointer hover:shadow-xl hover:border-primary/50 hover:scale-[1.03] hover:shadow-[0_0_20px_rgba(var(--primary-rgb),0.15)] group relative overflow-hidden"
                >
                  {/* Service Icon */}
                  <div className="mb-4 rounded-xl p-3 flex items-center justify-center bg-primary/10 border border-primary/20 text-primary transition-colors duration-300 group-hover:bg-primary group-hover:text-background">
                    {service.icon ? (
                      <img
                        src={displayIcon}
                        alt="icon"
                        className="w-6 h-6 sm:w-8 sm:h-8 md:w-10 md:h-10 object-contain filter group-hover:invert-0 dark:group-hover:invert group-hover:brightness-0"
                      />
                    ) : (
                      <span className="text-xl font-bold">⚙️</span>
                    )}
                  </div>

                  {/* Title */}
                  <div className="font-bold text-base sm:text-lg md:text-xl mb-2 text-foreground">
                    {service.service}
                  </div>

                  {/* Description Snippet */}
                  <div className="text-xs sm:text-sm text-foreground/70 mb-4 line-clamp-3 leading-relaxed">
                    {service.description}
                  </div>

                  {/* Read More */}
                  <div className="flex items-center gap-1.5 text-xs sm:text-sm font-bold text-primary group-hover:gap-2.5 transition-all mt-auto">
                    Read more
                    <span>→</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Detail Modal */}
      {openModal && selectedService && (
        <CardModal
          openModal={openModal}
          setOpenModal={setOpenModal}
          modalRef={modalRef}
          title={selectedService.service}
          className="flex flex-col overflow-hidden max-h-[70vh] sm:max-h-[80vh]"
        >
          <div className="text-xs sm:text-sm md:text-base leading-relaxed text-foreground/85 whitespace-pre-line">
            {selectedService.description}
          </div>
        </CardModal>
      )}
    </>
  );
}
