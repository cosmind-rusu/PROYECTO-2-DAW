namespace Backend.DTOs
{
    public class SuscripcionDTO
    {
        public string Nombre { get; set; } = string.Empty;
        public decimal Precio { get; set; }
        public string TipoServicio { get; set; } = string.Empty;
        public DateTime FechaInicio { get; set; }
        public string CicloCobro { get; set; } = string.Empty;
    }
}