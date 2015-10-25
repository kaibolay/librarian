import csv
import httplib
import urllib
import urllib2
import mysql.connector
from bs4 import BeautifulSoup

cnx = mysql.connector.connect(
    user='gssb', password='gssblib',
    host='localhost', database='spils')

barcode = '000002838' #raw_input('Barcode: ')

cursor = cnx.cursor(dictionary=True)
cursor.execute(
    'SELECT * FROM items where barcode = %s',
    (barcode,))
item = cursor.fetchone()
cursor.close()
cnx.close()

qry = '%(seriestitle)s %(title)s %(author)s' % item
params = {'q': qry, 'p': 1}

conn = httplib.HTTPSConnection("us.nicebooks.com")
conn.request('GET', '/searchResult?' + urllib.urlencode(params))
data = conn.getresponse().read()
conn.close()

soup = BeautifulSoup(data)
booklinks = [
    entry.div.div.a['href']
    for entry in soup.find_all(class_='search-result-line')
]

for link in booklinks:
    conn = httplib.HTTPSConnection("us.nicebooks.com")
    conn.request('GET', link)
    data = conn.getresponse().read()
    conn.close()

    soup = BeautifulSoup(data)
    # ISBN
    for prop in soup.find_all(itemprop='isbn'):
        print 'ISBN:', prop.text
    # Title
    for prop in soup.find_all('h1', itemprop='name'):
        print 'Title:', prop.text
    # Author
    for prop in soup.find_all(itemprop='author'):
        print 'Author:', prop.a.span.text
    # Image
    for prop in soup.find_all(itemprop='image'):
        print 'Image:', 'https:'+prop['src']
        img = urllib2.urlopen('https:'+prop['src'].split('?')[0])
        with open('images/'+barcode+'.jpg', 'wb') as ofile:
            ofile.write(img.read())
