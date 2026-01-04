# Earth Lens

**A Multimodal AI Framework for the Detection of Targeted Environmental and Infrastructure Hazards**

Earth Lens is a decentralized, community-driven monitoring platform that transforms everyday mobile devices into powerful sensors for reporting and verifying local hazards. Using multimodal AI, it automatically detects and categorizes:

- Severe road potholes
- Illegal solid waste dumps
- Aquatic and coastal contamination


## Background

As global urbanization accelerates, hyper-local environmental and infrastructure hazards—like deteriorating roads, illegal dumping, and water pollution—often go undetected by large-scale systems. These issues start small but can quickly escalate, posing risks to public safety, health, and ecosystems.

## Problem Statement

Traditional reporting mechanisms are slow, reactive, and burdened by manual verification processes. This leads to delays in municipal response, inefficient resource allocation, and prolonged environmental damage.

## Solution Overview

Earth Lens is a **Progressive Web App (PWA)** that enables citizens to capture geotagged images of hazards. Submissions are automatically verified using **Google Gemini Flash** (multimodal AI) via structured prompting in Google Cloud Functions.

Valid reports are stored in Firebase and displayed in real-time on a public dashboard powered by the **Google Maps JavaScript API**.

## Key Features

- Universal access via PWA (no app installation required)
- Image capture with Media Devices API
- Automatic geotagging using Geolocation API
- AI-powered classification (Pothole / Waste Dump / Water Pollution / Reject)
- Secure storage with Firebase Firestore & Storage
- Real-time public map dashboard with category filters and custom markers

## Technologies Used

- **Frontend**: JavaScript, Progressive Web App
- **Backend**: Firebase (Firestore, Storage, Cloud Functions)
- **AI**: Google Gemini Flash (multimodal) via Google Cloud
- **Mapping**: Google Maps JavaScript API
- **Browser APIs**: Media Devices API, Geolocation API

## Expected Outcomes

- High-resolution crowdsourced hazard mapping
- Significantly reduced verification time for authorities
- Improved accuracy and prioritization of interventions
- Enhanced transparency and community engagement

## Keywords

Multimodal AI • Crowdsourcing • Waste Management • Road Infrastructure • Environmental Monitoring • Citizen Science


## Contributing

Contributions, issues, and feature requests are welcome! Feel free to open a pull request or issue.

## License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.

> **MIT License**  
> Copyright (c) 2026 metaminds  
>  
> Permission is hereby granted, free of charge, to any person obtaining a copy  
> of this software and associated documentation files (the "Software"), to deal  
> in the Software without restriction, including without limitation the rights  
> to use, copy, modify, merge, publish, distribute, sublicense, and/or sell  
> copies of the Software, and to permit persons to whom the Software is  
> furnished to do so, subject to the following conditions:  
>  
> The above copyright notice and this permission notice shall be included in all  
> copies or substantial portions of the Software.  
>  
> THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR  
> IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,  
> FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE  
> AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER  
> LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,  
> OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE  
> SOFTWARE.

---

*Empowering communities to protect infrastructure and the environment, one report at a time.*
