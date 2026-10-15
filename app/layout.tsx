import type {Metadata} from 'next';import './style.css';
export const metadata:Metadata={title:'QuotientAI | Procurement intelligence',description:'Manage RFQs, suppliers and supplier quotations with confidence.'};
export default function Layout({children}:{children:React.ReactNode}){return <html lang="en"><body>{children}</body></html>}