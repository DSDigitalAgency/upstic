3.9 Required APIs 
1.	Right to Work - UK Home Office 
1.1.	British Citizen
1.1.1.	Credas – 3rd Party Integration / redirect - Result needs to saved as a PDF format
1.1.2.	E-bulk – 3rd Party Integration / redirect Result needs to saved as a PDF format
1.1.3.	Yoti – 3rd Party Integration / redirect to Result needs to saved as a PDF format
1.2.	Non British Citizen
1.2.1.	Employer – RECRUITER PORTAL
1.2.1.1.	Right to work online check: using share code https://www.gov.uk/view-right-to-work - Result needs to save as a PDF format
1.2.1.2.	Employer Checking Service 
1.2.1.3.	https://www.gov.uk/employee-immigration-employment-status Result needs to saved as a PDF format plus option to upload Supplementary Document for non British CITIZENS
1.2.2.	Candidate: AGENCY WORKER PORTAL
1.2.2.1.	UKVI account: Get access to your online immigration status (eVisa): https://www.gov.uk/get-access-evisa
1.2.2.2.	View and prove your immigration status: get a share code https://www.gov.uk/view-prove-immigration-status
COS – EMAIL AUTOMATION

2.	Professional Checks API
2.1.	Integration for validating and verifying professional credentials. 
GDC – Automation
https://olr.gdc-uk.org/searchregister
GMC – Automation 
Physician Associate Managed Voluntary Register (PAMVR) - Automation 
https://www.fparcp.co.uk/pamvr/search
GPC (General Optical Council) –  Automation
https://str.optical.org
GOC (Osteopathic) –  Automation
https://www.osteopathy.org.uk/register-search/
GPC (Pharmacy) –  Automation
https://www.pharmacyregulation.org/registers?utm_source=chatgpt.com

Pharmaceutical Society of Northern Ireland - Automation
https://registers.psni.org.uk
Social Work England – Automation
https://www.socialworkengland.org.uk/umbraco/surface/searchregister/results?utm_source=chatgpt.com
General Chiropractic Council – Automation
https://www.gcc-uk.org/?utm_source=chatgpt.com
NHS England Performers list – Automation
https://secure.pcse.england.nhs.uk/PerformersLists/

HPAN checks – Automated email 


3.1.	Payroll and invoicing management. 
4.	Reference Checks – Automation, + anuual + post placement feedback
5.	Compliance – Traffic light system (Automation)
6.	ID / DL / RTW Checks / Certificate of Sponsorship – Home Office, DVLA API and 3rd Party Integration / redirect – 
6.1.	Onfido - https://documentation.onfido.com - 3rd Party Integration / redirect
6.2.	GBG GB Group - 3rd Party Integration / redirect

Example Workflow for Healthcare Recruitment (Nurses/Carers):
1.	Step 1: Authentication
o	Use the DVLA Authentication API to verify the identity of the candidate.
2.	Step 2: Driver Data Check
o	Use the Access to Driver Data API to check if the driver’s licence is valid, whether they have any endorsements or penalty points, and what vehicle categories they are authorised to drive.
3.	Step 3: Vehicle Check (if applicable)
o	If the candidate is using their own vehicle or will be using a company vehicle, use the DVLA Vehicle Enquiry Service to check the vehicle’s tax status, MOT status, and other relevant details.
4.	Step 4: Identity Verification
o	If required, use the Driver Image API to match the driver’s photo on their driving licence with the person applying for the role.
________________________________________
Integration Considerations:
•	Automation: These checks can be automated in a custom-built CRM system where different API calls are triggered based on the type of check required. For example, you could set up an automated process where:
o	The driver is authenticated first.
o	Their driver data is checked second.
o	If they are driving a vehicle, the vehicle's MOT and tax status are verified.
o	The driver’s image is confirmed when necessary.
o	Bulk checks can be run for multiple employees or vehicles at once.
•	APIs as Independent Calls: Even though you can create an integrated system within your CRM, each API typically serves a different purpose and is called independently. However, you can sequence these checks in the order that fits your recruitment process.
7.	DBS 
7.1.	New DBS Checks – E-bulk Plus 3rd Party Integration / redirect 
7.2.	DBS Update service checks – Automate the process by building a custom workflow in your CRM and leveraging web scraping or browser automation to interact with the DBS Update Service directly
7.2.1.	Automating with Web Scraping/Browser Automation or
7.2.2.	Custom CRM Development for Automated Integration

9.	Professional Checks - (GDC, GMC, PAMVR, GPC (General Optical Council), GOC (Osteopathic), GPC (Pharmacy), HCPC,NMC, Pharmaceutical Society of Northern Ireland, Social Work England, General Chiropractic Council, NHS England Performers list, Konfir (government-accredited provider) of employment, income verification and gap verification services. (API Integration) - Automated – Daily / Weekly / Monthly checks, HPAN checks – Automated email 

11.	Mandatory Training certificates checks - Automated – Daily / Weekly / Monthly checks 
https://www.healthcare-register.co.uk – Automation required. No API
Automated email to the providers for training evrification
12.	Vendor Management Systems – parsing vacancies 
13.	Communication: Email – Gmail and outlook, VOIP, SMS, What’s app
14.	External CRM – Data import and export 
15.	CV / Vacancies Parsing 
16.	Job postings – Job portals and social media Integrations – Reed, Indeed, Jobs Gov, Nurses.co.uk, Facebook, LinkedIn
17.	Calendar integration 
18.	Address – API – drop down list - Ideal-Postcodes.co.uk PAF Licensed

20.	Option for this software to integrate to Public APIs for integrations into ATS, HRIS or CRMs. 
21.	Partners – Optional if anyone wants to partner with us. 

    
           


