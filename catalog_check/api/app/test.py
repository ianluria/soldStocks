# 43553,Y,AMAZON,B0019TWRSO,COUK,,"HP CB316EE 364 Original Ink Cartridge, Black, Pack of 1",HP,HP,PRINTER SUPPLIES,INK,SF INK,,,UK1
#

import re

row = '43553,Y,AMAZON,B0019TWRSO,COUK,,"HP CB316EE 364 Original Ink Cartridge, Black, Pack of 1",HP,HP,PRINTER SUPPLIES,INK,SF INK,,,UK1'

pattern = re.compile('"[^"]*",|[^,]*,|[^\s]+')

finalRow = [segment.strip(',"') for segment in re.findall(pattern, row)]

print(finalRow)
