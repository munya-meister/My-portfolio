from pathlib import Path

path = Path('public/resume/resume.pdf')
content_lines = [
    'q',
    '0 0 0 rg',
    '0 0 612 792 re f',
    '1 0.76 0.1 rg',
    '60 120 210 560 re f',
    '1 1 1 rg',
    '0.85 0.72 0.12 rg',
    '60 675 210 15 re f',
    '0 0 0 rg',
    '60 675 210 15 re s',
    'BT',
    '/F2 18 Tf',
    '70 735 Td',
    '(MUNYARADZI MBEWE) Tj',
    '0 -22 Td',
    '/F1 10 Tf',
    '(Digital Marketer | Web Developer | Brand Strategist | Creative Producer) Tj',
    '0 -26 Td',
    '(Creative professional with a passion for digital marketing, branding, web development, ) Tj',
    'T*',
    '(and multimedia production. Driven by continuous learning, innovative problem-solving, ) Tj',
    'T*',
    '(and a commitment to crafting meaningful digital experiences that connect brands with ) Tj',
    'T*',
    '(audiences.) Tj',
    'ET',
    '0.76 0.76 0.76 rg',
    'BT',
    '/F2 16 Tf',
    '300 735 Td',
    '(PROFILE) Tj',
    '0 -24 Td',
    '/F1 10 Tf',
    '(Location: Johannesburg, South Africa) Tj',
    'T*',
    '(Email: munyaradzi@example.com) Tj',
    'T*',
    '(Languages: English, Shona) Tj',
    'T*',
    '(Education: Higher Education / Creative Tech) Tj',
    'T*',
    '(Availability: Open for projects & collaborations) Tj',
    'ET',
    '0.85 0.72 0.12 rg',
    'BT',
    '/F2 14 Tf',
    '300 600 Td',
    '(CORE COMPETENCIES) Tj',
    '0 -22 Td',
    '/F1 10 Tf',
    '(React - JavaScript - SEO - Google Ads - Meta Ads - Branding - Canva - Photoshop - FL Studio) Tj',
    'ET',
    '0.76 0.76 0.76 rg',
    'BT',
    '/F2 14 Tf',
    '300 520 Td',
    '(PROJECTS & EXPERIENCE) Tj',
    '0 -24 Td',
    '/F1 10 Tf',
    '(Digital Marketing Specialist | 2023-Present) Tj',
    'T*',
    '(Freelance Web Developer | 2022-Present) Tj',
    'T*',
    '(Creative Media & Branding | 2021-Present) Tj',
    'T*',
    '(Professional Certifications | 2024-2026) Tj',
    'T*',
    '(BSc / Higher Education | 2019-2023) Tj',
    'ET',
    '0.85 0.72 0.12 rg',
    'BT',
    '/F2 14 Tf',
    '300 360 Td',
    '(CERTIFICATIONS) Tj',
    '0 -22 Td',
    '/F1 10 Tf',
    '(Google, Coursera, UXcel, Meta) Tj',
    'ET',
    '0.76 0.76 0.76 rg',
    'BT',
    '/F2 14 Tf',
    '300 320 Td',
    '(CONTACT) Tj',
    '0 -22 Td',
    '/F1 10 Tf',
    '(LinkedIn: linkedin.com/in/munyaradzi) Tj',
    'T*',
    '(Portfolio: portfolio.mbewe.com) Tj',
    'T*',
    '(Email: munyaradzi@example.com) Tj',
    'ET',
    'Q',
]
stream = '\n'.join(content_lines).encode('latin1')
obj1 = b'1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n'
obj2 = b'2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n'
obj3 = f'3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R /Resources << /Font << /F1 5 0 R /F2 6 0 R >> >> >>\nendobj\n'.encode('latin1')
obj4 = b'4 0 obj\n<< /Length %d >>\nstream\n' % len(stream) + stream + b'\nendstream\nendobj\n'
obj5 = b'5 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>\nendobj\n'
obj6 = b'6 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>\nendobj\n'
objs = [obj1, obj2, obj3, obj4, obj5, obj6]
xrefs = [0]
offset = 0
for obj in objs:
    xrefs.append(offset)
    offset += len(obj)
with path.open('wb') as f:
    f.write(b'%PDF-1.4\n%\xe2\xe3\xcf\xd3\n')
    for obj in objs:
        f.write(obj)
    xref_offset = f.tell()
    f.write(b'xref\n0 %d\n' % (len(objs) + 1))
    f.write(b'0000000000 65535 f \n')
    for off in xrefs[1:]:
        f.write(b'%010d 00000 n \n' % off)
    f.write(b'trailer\n<< /Size %d /Root 1 0 R >>\nstartxref\n%d\n%%EOF' % (len(objs) + 1, xref_offset))
print('Wrote PDF:', path)
