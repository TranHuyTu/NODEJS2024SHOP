# NODEJS2024SHOP

**Tại sao lại phải sử dụng Redis?**
--> Vấn đề này để giải quyết 2 vấn đề hiệu suất cao và đông thời cao
Hiệu suất cao: Giả sử người dùng truy cập vào 1 số dữ liệu đầu tiên quá trình này nó sẽ chậm hơn vì nod được đọc từ đĩa cứng Dis dữ liệu được người dùng truy cập trong bộ đệm dữ liệu do đó lần tiếp theo người dùng truy cập thì nó sẽ lấy từ bộ đệm (Catche) dữ liệu
Đồng thời cao: Là các yêu cầu mà bộ đệm hoạt động trực tiếp có thể chịu được bao nhiêu lớn hơn, nhiều hơn so với truy cập trực tiếp vào cơ sở dữ liệu vì vậy chúng ta có thể xem xét chuyển 1 phần dữ liệu trong cớ sở dữ liệu vào bộ đệm đêr 1 phần yêu cầu người dùng có thể đung trực tiếp mà không cần đi quan cơ sở dữ liệu.
**Mencached VS Redis**
-->Mencached chỉ hỗ trợ cho kiểu String, Sử dụng đa luồng.
-->Redis hỗ trợ nhiều kiểu dữ liệu phong phú hơn(Key-value, List, Collection, ...), Redis có tính hỗ trợ bền bỉ của dữ liệu( Có thể lưu trữ trong bộ nhớ, có thể trên đĩa, có thể tải sử dụng lại khi khởi động lại). Redis hỗ trợ Cluster, Redis hỗ trợ đơn luồng.
**Làm sao đặt thời gian hết hạn cho Redis**
-->Redis có nhiều cơ chế làm sạch sẽ môi trường của chúng ta(Xóa định kì, Xóa hết hạn)
