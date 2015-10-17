-- Adds the 'sycamore_id' column to the borrowers table
--
ALTER TABLE borrowers ADD sycamore_id varchar(100), ADD UNIQUE sycamore_id;

