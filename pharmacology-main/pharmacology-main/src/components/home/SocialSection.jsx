import React from "react";
import { FaYoutube, FaFacebookF, FaInstagram, FaTiktok, FaLinkedinIn, FaXTwitter} from "react-icons/fa6";

const SocialSection = () => {
  const socialData = [
    {
      id: 1,
      platform: "يوتيوب",
      icon: <FaYoutube className="text-2xl text-white" />,
      iconBg: "bg-red-600",
      handle: "Pharmacology",
      followers: "3.78 M",
      link: "https://www.youtube.com/@Dr_Ahmed_elkhateeb",
    },
    {
      id: 2,
      platform: "فيسبوك",
      icon: <FaFacebookF className="text-2xl text-white" />,
      iconBg: "bg-blue-600",
      handle: "AhmedElkhaateeb",
      followers: "3.1 M",
      link: "https://facebook.com/AhmedElkhaateeb",
    },
     {
      id: 3,
      platform: "تيك توك",
      icon: <FaTiktok className="text-2xl text-white" />,
      iconBg: "bg-black",
      handle: "drahmedelkhateeb",
      followers: "375.5 K",
      link: "https://tiktok.com/@drahmedelkhateeb",
    },
    {
      id: 4,
      platform: "انستجرام",
      icon: <FaInstagram className="text-2xl text-white" />,
      iconBg: "bg-pink-600",
      handle: "drahmedelkhateebb",
      followers: "330 K",
      link: "https://www.instagram.com/drahmedelkhateeb",
    },
   

    {
      id: 5,
      platform: "X",
      icon: <FaXTwitter className="text-2xl text-white" />,
      iconBg: "bg-black",
      handle: "PharmaDrAhmed",
      followers: "1 K",
      link: "https://x.com/PharmaDrAhmed",
    },
  ];

  return (
    <section dir="rtl" className="pb-10 px-6 md:px-20 font-sans">
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <div className="text-right mb-12">
          <h2 className="text-3xl md:text-4xl font-bold  py-4 mb-3">
            تابعني على منصاتي
          </h2>
          <p className=" text-lg">
            محتوي صحي يومي لملايين المتابعين
          </p>
        </div>

        {/* Cards */}
        <div  className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
          {socialData.map((item) => (
            <a
              key={item.id}
              href={item.link}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-white/70 backdrop-blur-lg border border-gray-100 rounded-2xl p-8 flex flex-col items-center text-center shadow-sm hover:shadow-xl hover:-translate-y-2 transition-all duration-300"
            >
              {/* Animated Icon */}
              <div
                className={`social-button w-16 h-16 rounded-full flex items-center justify-center mb-4 ${item.iconBg}`}
              >
                <span className="social-icon">{item.icon}</span>
              </div>

              {/* Platform */}
              <h3 className="text-xl font-bold gradient-text  mb-2">
                {item.platform}
              </h3>

              {/* Handle */}
              <p className="text-gray-500 text-sm mb-4" dir="ltr">
                {item.handle}
              </p>

              {/* Followers */}
              <div className="mt-auto">
                <p dir="ltr" className="text-xl font-bold gradient-text  mb-1">
                  {item.followers}
                </p>
                <p className="text-gray-500 text-sm">متابع</p>
              </div>
            </a>
          ))}
        </div>
      </div>

      {/* Animation */}
      <style jsx>{`
        @keyframes sway {
          0% {
            transform: rotate(-6deg);
          }
          100% {
            transform: rotate(6deg);
          }
        }

        .social-button {
          animation: sway 2s infinite alternate;
          perspective: 500px;
          transition: transform 0.5s, box-shadow 0.5s;
          box-shadow: 0 0 20px rgba(0, 0, 0, 0.15);
        }

        .social-button:hover {
          transform: scale(1.5) rotate(-360deg) translateY(-1em);
          box-shadow: 0 0 20px rgba(29, 161, 242, 0.5);
        }

        .social-icon {
          transition: transform 0.5s;
          filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.6));
        }

        .social-button:hover .social-icon {
          transform: scale(1.8);
        }
      `}</style>
    </section>
  );
};

export default SocialSection;