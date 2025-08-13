import type { GenerateWeeklyContentPlanOutput } from "@/ai/flows/generate-weekly-content-plan";
import { getWeek } from 'date-fns';

const currentYear = new Date().getFullYear();
const currentWeek = getWeek(new Date());

export const mockPlan: GenerateWeeklyContentPlanOutput = {
  "week": `${currentYear}-${String(currentWeek).padStart(2, '0')}`,
  "posts": [
    {
      "day": "Mon",
      "platforms": ["instagram", "facebook"],
      "idea": "Showcase our new product line",
      "caption_tr": "Yeni ürün serimizle tanışın! ✨ Tarzınıza modern bir dokunuş katın.",
      "caption_en": "Meet our new product line! ✨ Add a modern touch to your style.",
      "hashtags": ["#newarrivals", "#fashion", "#style"],
      "visual_brief": "A minimalist photo of the new products on a pastel background.",
      "recommended_time_local": "10:00",
      "cta": "Shop Now"
    },
    {
      "day": "Tue",
      "platforms": ["linkedin"],
      "idea": "Behind the scenes of our business",
      "caption_tr": "İşimizin perde arkası: Başarıya giden yolda ekibimizin adanmışlığı.",
      "caption_en": "Behind the scenes of our business: The dedication of our team on the road to success.",
      "hashtags": ["#business", "#teamwork", "#success"],
      "visual_brief": "A professional photo of the team collaborating in the office.",
      "recommended_time_local": "09:00",
      "cta": "Learn More"
    },
    {
      "day": "Wed",
      "platforms": ["instagram"],
      "idea": "User-generated content feature",
      "caption_tr": "Müşterilerimizden gelenler! Bu harika fotoğraf için teşekkürler!",
      "caption_en": "From our customers! Thanks for this amazing photo!",
      "hashtags": ["#customerlove", "#happycustomer", "#UGC"],
      "visual_brief": "A high-quality user-submitted photo featuring one of our products.",
      "recommended_time_local": "18:00",
      "cta": "Tag us to be featured"
    },
    {
      "day": "Thu",
      "platforms": ["facebook", "linkedin"],
      "idea": "Informative blog post promotion",
      "caption_tr": "Sektördeki son trendleri ele aldığımız yeni blog yazımız yayında!",
      "caption_en": "Our new blog post on the latest industry trends is now live!",
      "hashtags": ["#blogpost", "#industrytrends", "#learning"],
      "visual_brief": "A branded graphic with the title of the blog post.",
      "recommended_time_local": "12:00",
      "cta": "Read More"
    },
    {
      "day": "Fri",
      "platforms": ["instagram", "facebook"],
      "idea": "Friday vibes and weekend special offer",
      "caption_tr": "Hafta sonu coşkusu! 🎉 Bu hafta sonuna özel %20 indirimle kendinizi şımartın.",
      "caption_en": "Weekend vibes! 🎉 Treat yourself with our special 20% off this weekend.",
      "hashtags": ["#fridayfeeling", "#weekenddeal", "#sale"],
      "visual_brief": "A fun, energetic lifestyle image related to the products.",
      "recommended_time_local": "20:00",
      "cta": "Shop the Sale"
    },
    {
      "day": "Sat",
      "platforms": ["instagram"],
      "idea": "Interactive question or poll",
      "caption_tr": "Hafta sonu tercihiniz: Evde dinlenmek mi, dışarıda macera mı? Yorumlarda bize bildirin!",
      "caption_en": "Your weekend choice: Relaxing at home or adventure outside? Let us know in the comments!",
      "hashtags": ["#weekendpoll", "#saturday", "#community"],
      "visual_brief": "A split image showing a cozy home scene and an outdoor adventure.",
      "recommended_time_local": "11:00",
      "cta": "Comment below"
    },
    {
      "day": "Sun",
      "platforms": ["facebook"],
      "idea": "Preview of the upcoming week",
      "caption_tr": "Yeni haftaya hazır mısınız? Önümüzdeki hafta sizi harika sürprizler bekliyor!",
      "caption_en": "Ready for the new week? Amazing surprises are waiting for you next week!",
      "hashtags": ["#comingsoon", "#sneakpeek", "#motivation"],
      "visual_brief": "A teaser graphic with blurred images of new items or announcements.",
      "recommended_time_local": "19:00",
      "cta": "Stay Tuned"
    }
  ]
};
