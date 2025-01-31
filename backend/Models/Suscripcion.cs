using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Backend.Models
{
    public class Suscripcion
    {
        [Key]
        public int Id { get; set; }

        [Required]
        public int UsuarioId { get; set; }

        [Required]
        [StringLength(100)]
        public string Nombre { get; set; } = string.Empty;

        [Required]
        [Column(TypeName = "decimal(10,2)")]
        public decimal Precio { get; set; }

        [Required]
        public string TipoServicio { get; set; } = string.Empty;

        public DateTime FechaInicio { get; set; } = DateTime.UtcNow;

        public bool Activa { get; set; } = true;

        [Required]
        public string CicloCobro { get; set; } = string.Empty;

        [ForeignKey("UsuarioId")]
        public Usuario? Usuario { get; set; }
    }
}