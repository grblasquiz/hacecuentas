import json, sys
for f in sys.argv[1:]:
    c=json.load(open(f))
    print("\n###", c['slug'], "(formulaId:", c.get('formulaId'),")")
    for fld in (c.get('fields') or []):
        opts=fld.get('options')
        ostr=''
        if opts:
            ov=[ (o.get('value') if isinstance(o,dict) else o) for o in opts][:6]
            ostr=' opts='+str(ov)
        print(f"  - {fld.get('id') or fld.get('name')} ({fld.get('type','number')}) ph={fld.get('placeholder')}{ostr}")
    print("  OUTPUTS:", [o.get('id') for o in (c.get('outputs') or [])])
