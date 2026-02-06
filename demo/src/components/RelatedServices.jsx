import React, { useContext, useEffect, useState } from 'react';
import { MedicalContext } from '../context/MedicalContext';
import { useNavigate } from 'react-router-dom';

const RelatedServices = ({ category, serviceId }) => {
  const { Medicalservices } = useContext(MedicalContext);
  const [relatedServices, setRelatedServices] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    if (Medicalservices.length > 0 && category) {
      const servicesData = Medicalservices.filter(
        (service) => service.category === category && service._id !== serviceId
      );
      setRelatedServices(servicesData);
    }
  }, [Medicalservices, category, serviceId]);

  return (
    <div dir="rtl" className='flex flex-col items-center gap-4 my-16 text-textMain md:mx-10'>
      <h1 className='text-3xl font-bold text-primary'>خدمات مشابهة</h1>
      <p className='sm:w-1/2 text-center text-textSoft text-sm leading-relaxed'>
        استكشف المزيد من الخدمات في نفس التخصص
      </p>
      
      <div className='w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 pt-5 px-3 sm:px-0'>
        {relatedServices.slice(0, 4).map((item, index) => (
          <div 
            onClick={() => { navigate(`/appointment/${item._id}`); scrollTo(0, 0) }} 
            className='border border-borderLight rounded-xl overflow-hidden cursor-pointer hover:-translate-y-2 transition-all duration-500 bg-white hover:shadow-lg hover:border-secondary'
            key={index}
          >
            <img className='bg-lightBg w-full h-48 object-contain p-6' src={item.image} alt={item.title} />
            
            <div className='p-4'>
              <div className='flex items-center gap-2 text-sm text-green-500 mb-2'>
                <p className='w-2 h-2 bg-green-500 rounded-full'></p>
                <p>متاح</p>
              </div>
              
              <p className='text-textMain text-lg font-semibold mb-1'>{item.title}</p>
              <p className='text-textSoft text-sm mb-2'>{item.category_ar}</p>
              
              <div className='flex items-center justify-between mt-3'>
                <span className='text-primary font-bold'>{item.fees} جنيه</span>
                <span className='text-textSoft text-xs'>{item.duration || '30 دقيقة'}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {relatedServices.length > 4 && (
        <button 
          onClick={() => { navigate(`/medical-services/${category}`); scrollTo(0, 0) }} 
          className='bg-accent text-primary px-12 py-3 rounded-full mt-10 font-medium hover:bg-secondary hover:text-white transition-all duration-300 border border-borderLight'
        >
          عرض جميع خدمات {relatedServices[0]?.category_ar}
        </button>
      )}
    </div>
  );
}

export default RelatedServices;