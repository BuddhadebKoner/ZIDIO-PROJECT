import { useEffect, useRef, useState } from "react";

export const AnimatedSection = ({ children, delay = 0 }) => {
   const [isVisible, setIsVisible] = useState(false);
   const [isLoaded, setIsLoaded] = useState(false);
   const sectionRef = useRef(null);

   useEffect(() => {
      const observer = new IntersectionObserver(
         ([entry]) => {
            if (entry.isIntersecting) {
               setIsVisible(true);
               setIsLoaded(true);
               observer.unobserve(sectionRef.current);
            }
         },
         { threshold: 0.1 }
      );

      if (sectionRef.current) {
         observer.observe(sectionRef.current);
      }

      return () => {
         if (sectionRef.current) {
            observer.unobserve(sectionRef.current);
         }
      };
   }, []);

   return (
      <div
         ref={sectionRef}
         className={`transition-opacity duration-700 ease-in-out ${isVisible ? 'opacity-100 translate-y-0 animate-fadeIn' : 'opacity-0 translate-y-8'
            }`}
         style={{ transitionDelay: `${delay}ms` }}
      >
         {isLoaded ? children : <div className="h-64 bg-gray-100 animate-pulse rounded-md" />}
      </div>
   );
};